export interface RestClientOptions {
    recv_window?: number;
    sync_interval_ms?: number | string;
    disable_time_sync?: boolean;
    strict_param_validation?: boolean;
    baseUrl?: string;
    parse_exceptions?: boolean;
}
export declare type GenericAPIResponse = Promise<any>;
export declare function serializeParams(params?: object, strict_validation?: boolean): string;
export declare function getRestBaseUrl(useLivenet: boolean, restInverseOptions: RestClientOptions): string;
export declare function isPublicEndpoint(endpoint: string): boolean;
export declare function isWsPong(response: any): any;
