declare class ServiceTestScript {
    private baseUrl;
    private port;
    constructor();
    initialize(): Promise<void>;
    waitForService(): Promise<void>;
    testHealthCheck(): Promise<boolean>;
    testQueryEndpoint(query?: string, queryType?: string): Promise<any>;
    testMultipleQueries(): Promise<boolean>;
    testErrorHandling(): Promise<boolean>;
    runFullServiceTest(): Promise<void>;
    printTestSummary(results: any): void;
    cleanup(): Promise<void>;
}
export { ServiceTestScript };
