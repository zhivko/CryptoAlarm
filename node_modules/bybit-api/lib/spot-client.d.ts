import { AxiosRequestConfig } from 'axios';
import { KlineInterval } from './types/shared';
import { NewSpotOrder, OrderSide, OrderTypeSpot, SpotOrderQueryById } from './types/spot';
import BaseRestClient from './util/BaseRestClient';
import { GenericAPIResponse, RestClientOptions } from './util/requestUtils';
import RequestWrapper from './util/requestWrapper';
export declare class SpotClient extends BaseRestClient {
    protected requestWrapper: RequestWrapper;
    /**
     * @public Creates an instance of the Spot REST API client.
     *
     * @param {string} key - your API key
     * @param {string} secret - your API secret
     * @param {boolean} [useLivenet=false]
     * @param {RestClientOptions} [restClientOptions={}] options to configure REST API connectivity
     * @param {AxiosRequestConfig} [requestOptions={}] HTTP networking options for axios
     */
    constructor(key?: string | undefined, secret?: string | undefined, useLivenet?: boolean, restClientOptions?: RestClientOptions, requestOptions?: AxiosRequestConfig);
    getServerTime(urlKeyOverride?: string): Promise<number>;
    /**
     *
     * Market Data Endpoints
     *
    **/
    getSymbols(): GenericAPIResponse;
    getOrderBook(symbol: string, limit?: number): GenericAPIResponse;
    getMergedOrderBook(symbol: string, scale?: number, limit?: number): GenericAPIResponse;
    getTrades(symbol: string, limit?: number): GenericAPIResponse;
    getCandles(symbol: string, interval: KlineInterval, limit?: number, startTime?: number, endTime?: number): GenericAPIResponse;
    get24hrTicker(symbol?: string): GenericAPIResponse;
    getLastTradedPrice(symbol?: string): GenericAPIResponse;
    getBestBidAskPrice(symbol?: string): GenericAPIResponse;
    /**
     * Account Data Endpoints
     */
    submitOrder(params: NewSpotOrder): GenericAPIResponse;
    getOrder(params: SpotOrderQueryById): GenericAPIResponse;
    cancelOrder(params: SpotOrderQueryById): GenericAPIResponse;
    cancelOrderBatch(params: {
        symbol: string;
        side?: OrderSide;
        orderTypes: OrderTypeSpot[];
    }): GenericAPIResponse;
    getOpenOrders(symbol?: string, orderId?: string, limit?: number): GenericAPIResponse;
    getPastOrders(symbol?: string, orderId?: string, limit?: number): GenericAPIResponse;
    getMyTrades(symbol?: string, limit?: number, fromId?: number, toId?: number): GenericAPIResponse;
    /**
     * Wallet Data Endpoints
     */
    getBalances(): GenericAPIResponse;
}
