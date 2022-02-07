"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class SharedEndpoints {
    /**
     *
     * Market Data Endpoints
     *
     */
    getOrderBook(params) {
        return this.requestWrapper.get('v2/public/orderBook/L2', params);
    }
    /**
     * Get latest information for symbol
     */
    getTickers(params) {
        return this.requestWrapper.get('v2/public/tickers', params);
    }
    getSymbols() {
        return this.requestWrapper.get('v2/public/symbols');
    }
    /**
     *
     * Market Data : Advanced
     *
     */
    getOpenInterest(params) {
        return this.requestWrapper.get('v2/public/open-interest', params);
    }
    getLatestBigDeal(params) {
        return this.requestWrapper.get('v2/public/big-deal', params);
    }
    getLongShortRatio(params) {
        return this.requestWrapper.get('v2/public/account-ratio', params);
    }
    /**
     *
     * Account Data Endpoints
     *
     */
    getApiKeyInfo() {
        return this.requestWrapper.get('v2/private/account/api-key');
    }
    /**
     *
     * Wallet Data Endpoints
     *
     */
    getWalletBalance(params) {
        return this.requestWrapper.get('v2/private/wallet/balance', params);
    }
    getWalletFundRecords(params) {
        return this.requestWrapper.get('v2/private/wallet/fund/records', params);
    }
    getWithdrawRecords(params) {
        return this.requestWrapper.get('v2/private/wallet/withdraw/list', params);
    }
    getAssetExchangeRecords(params) {
        return this.requestWrapper.get('v2/private/exchange-order/list', params);
    }
    /**
     *
     * API Data Endpoints
     *
     */
    getServerTime() {
        return this.requestWrapper.get('v2/public/time');
    }
    getApiAnnouncements() {
        return this.requestWrapper.get('v2/public/announcement');
    }
    getTimeOffset() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            return this.getServerTime().then(result => {
                const end = Date.now();
                return Math.ceil((result.time_now * 1000) - end + ((end - start) / 2));
            });
        });
    }
}
exports.default = SharedEndpoints;
//# sourceMappingURL=shared-endpoints.js.map