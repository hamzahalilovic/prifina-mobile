#ifndef prifina_Bridging_Header_h
#define prifina_Bridging_Header_h

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppGroupModule, NSObject)

RCT_EXTERN_METHOD(saveDataToAppGroup:(NSString *)data)
RCT_EXTERN_METHOD(getDataFromAppGroup:(NSString *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end

#endif /* prifina_Bridging_Header_h */
