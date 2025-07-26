export declare class JsonRepairService {
    private readonly logger;
    parse<T>(jsonString: string): T;
    private preProcess;
    private fixCommonJsonIssues;
    private sanitizeJsonContent;
    private attemptJSONRepair;
}
