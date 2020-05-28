import { User } from "../../sbg-api-client/interfaces";
import {CWLExecutorConfig} from "./cwl-executor-config";
import {ExecutorConfig} from "./executor-config";
import {RepositoryType} from "./repository-type";
import {TabData} from "./tab-data-interface";
import {defaultCWLExecutionOutputDirectory} from "../../controllers/cwl-execution-results.controller";
import {defaultExecutionOutputDirectory} from "../../controllers/execution-results.controller";
import {ProxySettings} from "./proxy-settings";

export interface CredentialsCache {
    id: string;
    user: Partial<User>;
    url: string;
    token: string;
}

export class LocalRepository extends RepositoryType {

    activeCredentials: CredentialsCache = null;

    credentials: CredentialsCache[] = [];

    localFolders: string[] = [];

    publicAppsGrouping: "toolkit" | "category" = "toolkit";

    selectedAppsPanel: "myApps" | "publicApps" = "myApps";

    sidebarHidden = false;

    cwlExecutorConfig: CWLExecutorConfig = {
        executorPath: "/usr/local/bin/cwl-runner",
        outDir: defaultCWLExecutionOutputDirectory,
        executorParams: "--timestamps"
    };

    cwlExecutorConfigHistory: CWLExecutorConfig[] = [];

    executorConfig: ExecutorConfig = {
        path: "",
        choice: "bundled",
        outDir: defaultExecutionOutputDirectory
    };

    proxySettings: ProxySettings = {
        useProxy: false,
        server: "",
        port: null,
        useAuth: false,
        username: "",
        password: ""
    };

    openTabs: TabData<any> [] = [{
        id: "?welcome",
        label: "Welcome",
        type: "Welcome"
    }];

    ignoredUpdateVersion = null;
}
