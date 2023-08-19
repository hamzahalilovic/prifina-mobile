import Foundation
import React

@objc(AppGroupModule)
class AppGroupModule: NSObject, RCTBridgeModule {
    static func moduleName() -> String! {
        return "AppGroupModule"
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc(saveDataToAppGroup:)
    func saveDataToAppGroup(data: String) {
        let appGroupIdentifier = "group.com.prifina.reactjs"
        let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier)
        sharedDefaults?.set(data, forKey: "sharedData")
        sharedDefaults?.synchronize()
    }

  @objc(getDataFromAppGroup:resolver:rejecter:)
  func getDataFromAppGroup(_ data: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      let appGroupIdentifier = "group.com.prifina.reactjs"
      let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier)
      let data = sharedDefaults?.string(forKey: "sharedData")
      resolve(data)
  }

}


