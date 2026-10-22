import * as vscode from 'vscode';
import { checkText } from './core/checker';
import { createCrossrefClient, type CrossrefClient } from './core/crossref';
import { validateLicenseKey } from './core/license';
import { LIMITS, LIMITS_URL, limitsLine } from './core/limits';
import { kindForFile } from './core/parse';
import { isAllowed, proRequiredMessage, type ProFeature } from './core/pro';
import { renderReport, type ReportFormat } from './core/report';
import { checkResultMessage, findingLines, firstFinding, SHOW_FINDINGS, SHOW_LIMITS, SHOW_OUTPUT } from './core/summary';
import type { FileReport, Finding, Severity } from './core/types';

declare const CITE_LEDGER_VERSION: string | undefined;
const VERSION = typeof CITE_LEDGER_VERSION === 'string' ? CITE_LEDGER_VERSION : '0.1.0';

const SECRET_KEY = 'citeLedger.licenseKey';
const LICENSE_CACHE_KEY = 'citeLedger.licenseCache';
const LICENSE_CACHE_MS = 24 * 60 * 60 * 1000;
const REFERENCE_GLOB = '**/*.{bib,tex,ltx,md,markdown,qmd,rmd}';
const MAX_WORKSPACE_FILES = 2000;

interface LicenseCache {
  readonly valid: boolean;
  readonly checkedAt: number;
}

const SEVERITY: Readonly<Record<Severity, vscode.DiagnosticSeverity>> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  info: vscode.DiagnosticSeverity.Information,
};

function toDiagnostic(document: vscode.TextDocument | undefined, finding: Finding): vscode.Diagnostic {
  const endLine = document ? Math.min(finding.endLine, document.lineCount - 1) : finding.endLine;
  const endCharacter = document ? document.lineAt(endLine).range.end.character : 0;
  const range = new vscode.Range(finding.startLine, 0, endLine, endCharacter);
  const evidence = finding.evidence.map((item) => `${item.label}: ${item.url}`).join('; ');
  const message = `${finding.message}\nEvidence: ${evidence}\nCould be wrong: ${finding.couldBeWrong}\n${limitsLine()}`;
  const diagnostic = new vscode.Diagnostic(range, message, SEVERITY[finding.severity]);
  diagnostic.source = 'Cite Ledger';
  diagnostic.code = { value: finding.claim ? `${finding.claim} ${finding.kind}` : finding.kind, target: vscode.Uri.parse(codeTarget(finding)) };
  return diagnostic;
}

/**
 * The link on the diagnostic's code. vscode.Uri re-encodes "=" and "&", which breaks a search
 * URL, so query URLs stay in the message text and the code links to a query-free page.
 */
function codeTarget(finding: Finding): string {
  if (finding.kind === 'unverified') {
    return `${LIMITS_URL}#l3`;
  }
  return finding.evidence.find((item) => !item.url.includes('?'))?.url ?? LIMITS_URL;
}

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = vscode.languages.createDiagnosticCollection('cite-ledger');
  const lastReports = new Map<string, FileReport>();
  const output = vscode.window.createOutputChannel('Cite Ledger');
  context.subscriptions.push(diagnostics, output);

  function crossref(): CrossrefClient {
    const mailto = vscode.workspace.getConfiguration('citeLedger').get<string>('mailto', '').trim();
    return createCrossrefClient({ ...(mailto ? { mailto } : {}), userAgent: `CiteLedger/${VERSION} (https://github.com/Tempuskg/cite-ledger)` });
  }

  async function licensed(): Promise<boolean> {
    const key = await context.secrets.get(SECRET_KEY);
    if (!key) {
      return false;
    }
    const cached = context.globalState.get<LicenseCache>(LICENSE_CACHE_KEY);
    if (cached && Date.now() - cached.checkedAt < LICENSE_CACHE_MS) {
      return cached.valid;
    }
    const result = await validateLicenseKey(key);
    await context.globalState.update(LICENSE_CACHE_KEY, { valid: result.valid, checkedAt: Date.now() } satisfies LicenseCache);
    return result.valid;
  }

  async function requirePro(feature: ProFeature): Promise<boolean> {
    if (isAllowed(feature, await licensed())) {
      return true;
    }
    const choice = await vscode.window.showInformationMessage(proRequiredMessage(feature), 'Enter Licence Key');
    if (choice === 'Enter Licence Key') {
      await vscode.commands.executeCommand('citeLedger.enterLicenseKey');
    }
    return false;
  }

  async function checkDocument(document: vscode.TextDocument, client: CrossrefClient, pro: boolean): Promise<FileReport | undefined> {
    const kind = kindForFile(document.fileName);
    if (!kind) {
      return undefined;
    }
    const report = await checkText(vscode.workspace.asRelativePath(document.uri), document.getText(), kind, { crossref: client, pro });
    lastReports.set(document.uri.toString(), report);
    diagnostics.set(document.uri, report.results.flatMap((result) => result.findings.map((finding) => toDiagnostic(document, finding))));
    return report;
  }

  /** Logs the run, then shows its result with buttons that lead to the findings. */
  async function showResult(reports: readonly FileReport[], document?: vscode.TextDocument): Promise<void> {
    const result = checkResultMessage(reports);
    output.appendLine(result.text);
    reports.forEach((report) => findingLines(report).forEach((line) => output.appendLine(line)));
    const choice = await vscode.window.showInformationMessage(result.text, ...result.actions);
    if (choice === SHOW_FINDINGS) {
      const first = reports.length === 1 && reports[0] ? firstFinding(reports[0]) : undefined;
      if (document && first) {
        const start = new vscode.Position(first.startLine, 0);
        await vscode.window.showTextDocument(document, { selection: new vscode.Range(start, start), preserveFocus: false });
      }
      await vscode.commands.executeCommand('workbench.actions.view.problems');
    } else if (choice === SHOW_OUTPUT) {
      output.show(true);
    } else if (choice === SHOW_LIMITS) {
      await vscode.commands.executeCommand('citeLedger.showLimits');
    }
  }

  async function checkActiveFile(document?: vscode.TextDocument): Promise<void> {
    const target = document ?? vscode.window.activeTextEditor?.document;
    if (!target || !kindForFile(target.fileName)) {
      void vscode.window.showInformationMessage('Open a .bib, .tex or Markdown file to check its references.');
      return;
    }
    const pro = await licensed();
    const report = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Cite Ledger: checking references against Crossref' },
      () => checkDocument(target, crossref(), pro),
    );
    if (report) {
      void showResult([report], target);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('citeLedger.checkFile', (uri?: vscode.Uri) =>
      uri ? vscode.workspace.openTextDocument(uri).then((document) => checkActiveFile(document)) : checkActiveFile()),

    vscode.commands.registerCommand('citeLedger.scanWorkspace', async () => {
      if (!(await requirePro('workspace-scan'))) {
        return;
      }
      const uris = await vscode.workspace.findFiles(REFERENCE_GLOB, '**/{node_modules,.git,dist,out}/**', MAX_WORKSPACE_FILES);
      const client = crossref();
      const reports: FileReport[] = [];
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Cite Ledger: checking workspace references', cancellable: true },
        async (progress, token) => {
          for (const uri of uris) {
            if (token.isCancellationRequested) {
              break;
            }
            progress.report({ message: vscode.workspace.asRelativePath(uri), increment: 100 / uris.length });
            const report = await checkDocument(await vscode.workspace.openTextDocument(uri), client, true);
            if (report && report.results.length > 0) {
              reports.push(report);
            }
          }
        },
      );
      void showResult(reports);
    }),

    vscode.commands.registerCommand('citeLedger.exportReport', async () => {
      if (!(await requirePro('export-report'))) {
        return;
      }
      if (lastReports.size === 0) {
        void vscode.window.showInformationMessage('Run a check first; the report covers the files checked in this session.');
        return;
      }
      const target = await vscode.window.showSaveDialog({
        filters: { Markdown: ['md'], CSV: ['csv'], JSON: ['json'] },
        defaultUri: vscode.Uri.file('cite-ledger-report.md'),
      });
      if (!target) {
        return;
      }
      const extension = target.path.split('.').pop()?.toLowerCase() ?? 'md';
      const format: ReportFormat = extension === 'csv' || extension === 'json' ? extension : 'md';
      const text = renderReport([...lastReports.values()], format, { version: VERSION, generatedAt: new Date() });
      await vscode.workspace.fs.writeFile(target, Buffer.from(text, 'utf8'));
      void vscode.window.showInformationMessage(`Cite Ledger report saved to ${target.fsPath}.`);
    }),

    vscode.commands.registerCommand('citeLedger.enterLicenseKey', async () => {
      const key = await vscode.window.showInputBox({
        prompt: 'Cite Ledger Pro licence key. It is checked with Polar, the payment provider, and stored in VS Code secret storage.',
        ignoreFocusOut: true,
        password: true,
      });
      if (!key) {
        return;
      }
      const result = await validateLicenseKey(key);
      if (!result.valid) {
        void vscode.window.showErrorMessage(`Licence not accepted: ${result.reason}`);
        return;
      }
      await context.secrets.store(SECRET_KEY, key.trim());
      await context.globalState.update(LICENSE_CACHE_KEY, { valid: true, checkedAt: Date.now() } satisfies LicenseCache);
      void vscode.window.showInformationMessage('Cite Ledger Pro is unlocked. Thank you.');
    }),

    vscode.commands.registerCommand('citeLedger.clearLicenseKey', async () => {
      await context.secrets.delete(SECRET_KEY);
      await context.globalState.update(LICENSE_CACHE_KEY, undefined);
      void vscode.window.showInformationMessage('Cite Ledger licence key removed.');
    }),

    vscode.commands.registerCommand('citeLedger.showLimits', async () => {
      const choice = await vscode.window.showInformationMessage(
        LIMITS.map((limit) => `${limit.id}: ${limit.text}`).join(' '),
        { modal: true },
        'Open Limits Page',
      );
      if (choice === 'Open Limits Page') {
        await vscode.env.openExternal(vscode.Uri.parse(LIMITS_URL));
      }
    }),

    vscode.commands.registerCommand('citeLedger.clearFindings', () => {
      diagnostics.clear();
      lastReports.clear();
    }),

    vscode.workspace.onDidSaveTextDocument(async (document) => {
      if (kindForFile(document.fileName) && vscode.workspace.getConfiguration('citeLedger', document.uri).get<boolean>('checkOnSave', false)) {
        await checkDocument(document, crossref(), await licensed());
      }
    }),

    vscode.workspace.onDidCloseTextDocument((document) => {
      lastReports.delete(document.uri.toString());
    }),
  );
}

export function deactivate(): void {
  // Nothing to release: diagnostics and channels are disposed through the context.
}
