import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
const jailed = require('jailed');

export interface SandboxResponse {
    output: string,
    error: string
}

export class SandboxService {

    /** External Job exposed to the jailedApi */
    public exposedJob: Object;

    public exposedSelf: Object;

    /** Object exposed to Jailed */
    private jailedApi: Object;

    /** Jailed plugin instance */
    private plugin: any;

    /** Result of the expression evaluation */
    private expressionResult: Observable<SandboxResponse>;

    private updateExpressionResult: Subject<SandboxResponse> = new Subject<SandboxResponse>(undefined);

    constructor() {
        const self = this;

        this.expressionResult = this.updateExpressionResult
            .filter(result => result !== undefined);

        this.jailedApi = {
            output: function(data) {
                const output: string = self.stringify(data.output);
                const error: string = data.error;

                self.updateExpressionResult.next({
                    output: output,
                    error: error
                });

                self.disconnect();
            }
        };
    }

    // sends the input to the plugin for evaluation
    public submit(code): Observable<SandboxResponse> {

        //make sure the code is a string
        const codeToExecute: string = JSON.stringify(code);

        const $job: string = this.exposedJob ? JSON.stringify(this.exposedJob): undefined;
        const $self: string = this.exposedSelf ? JSON.stringify(this.exposedSelf): undefined;
        const expressionCode = this.createExpressionCode(codeToExecute, $job, $self);

        this.plugin = new jailed.DynamicPlugin(expressionCode, this.jailedApi);

        this.plugin.whenConnected(() => {
            this.waitFoResponse();
        });

        return this.expressionResult;
    }

    private waitFoResponse(): void {
        setTimeout(() => {
            console.log("Sandbox response timed out.");
            this.disconnect();
        }, 3000);
    }

    private disconnect(): void {
        this.plugin.disconnect();
    }

    private createExpressionCode(codeToExecute, $job, $self): string {
        return `var runHidden = ${this.runHidden};
           
            var execute = function(codeString, job, self) {
            
                var result = {
                    output: undefined,
                    error: undefined
                };

                try {
                    result.output = runHidden(codeString, job, self);
                } catch(e) {
                    result.error = e.message;
                }

                application.remote.output(result);
            }
            `
            // We don't use a template literal for the code,
            // because we want to evaluate it inside the worker.
            + "execute(" + codeToExecute + "," + $job + "," + $self + ")";
    }

    // protects even the worker scope from being accessed
    public runHidden(code, $job?, $self?): any {

        const indexedDB = undefined;
        const location = undefined;
        const navigator = undefined;
        const onerror = undefined;
        const onmessage = undefined;
        const performance = undefined;
        const self = undefined;
        const webkitIndexedDB = undefined;
        const postMessage = undefined;
        const close = undefined;
        const openDatabase = undefined;
        const openDatabaseSync = undefined;
        const webkitRequestFileSystem = undefined;
        const webkitRequestFileSystemSync = undefined;
        const webkitResolveLocalFileSystemSyncURL = undefined;
        const webkitResolveLocalFileSystemURL = undefined;
        const addEventListener = undefined;
        const dispatchEvent = undefined;
        const removeEventListener = undefined;
        const dump = undefined;
        const onoffline = undefined;
        const ononline = undefined;
        const importScripts = undefined;
        const console = undefined;
        const application = undefined;

        return eval(code);
    }

    // converts the output into a string
    public stringify(output: any): string {
        let result: any;

        if (typeof output === "string") {
            return output
        }

        if (typeof output === "undefined") {
            result = "undefined";
        } else if (output === null) {
            result = "null";
        } else {
            result = JSON.stringify(output) || output.toString();
        }

        return result;
    }

    public getValueFromSandBoxResponse(sandboxResponse: SandboxResponse): string {
        if (sandboxResponse.output === "undefined" || sandboxResponse.output === "null") {
            return "";
        } else {
            return sandboxResponse.output;
        }
    }
}
