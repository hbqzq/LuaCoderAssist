'use strict';
const fmt = require('lua-fmt');
const langserver = require('vscode-languageserver');
const awaiter = require('./lib/awaiter');
const child_process = require('child_process');
const iconv_lite_1 = require('iconv-lite');
const path_1 = require('path');
const default_luafmt_executor = path_1.resolve(__dirname, '../../3rd/luafmt/luafmt.exe');

class FormatProvider {
    constructor(coder) {
        this.coder = coder;
        this.encoding = 'gbk';
    }

    formatOnTyping(params) {
        let uri = params.textDocument.uri;
        let opt = this.coder.settings.format;

        let pos = params.position;
        let char = params.ch;

        // this.coder.tracer.info(JSON.stringify(params));

        return [];
    }

    formatRangeText(params) {
        return awaiter.await(this, void 0, void 0, function* () {
            let uri = params.textDocument.uri;
            let opt = this.coder.settings.format;

            let document = yield this.coder.document(uri);

            let text
            let range = params.range;

            text = document.getText();
            if (!range) {
                let endPos = document.positionAt(text.length);
                range = langserver.Range.create(0, 0, endPos.line, endPos.character);
            } else {
                text = text.substring(document.offsetAt(range.start), document.offsetAt(range.end));
            }

            let inputBuffer = iconv_lite_1.encode(text, this.encoding);
            let args = [];

            let options = this._formatOptions(opt);
            if (options.useTabs) {
                args.push('--use-tabs');
            }
            args.push('--indent-count');
            args.push(options.indentCount);

            if (options.formatComments) {
                args.push('--format-comments');
            }

            let outputBuffer = child_process.execFileSync(default_luafmt_executor, args, {
                input: inputBuffer,
                windowsHide: true,
            })

            let formattedText = iconv_lite_1.decode(outputBuffer, this.encoding);

            // let formattedText = fmt.formatText(text, this._formatOptions(opt));

            return [langserver.TextEdit.replace(range, formattedText)];
        });
    }

    _formatOptions(userOptions) {
        return {
            lineWidth: userOptions.lineWidth || 120,
            indentCount: userOptions.indentCount || 4,
            quotemark: userOptions.quotemark || 'single',
            useTabs: userOptions.useTabs,
            formatComments: userOptions.formatComments,
        };
    }
};

exports.FormatProvider = FormatProvider;
