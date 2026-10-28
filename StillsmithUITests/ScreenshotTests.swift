//
//  ScreenshotTests.swift
//  StillsmithUITests
//
//  Captures the screens the website uses. Run by .github/workflows/screenshots.yml;
//  the PNGs are exported from the result bundle and copied into site/src/assets/screens.
//

import XCTest

final class StillsmithScreenshotTests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    private func launch(onboardingSeen: Bool = true) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-hasSeenOnboarding", onboardingSeen ? "YES" : "NO"]
        app.launch()
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 60))
        return app
    }

    private func capture(_ app: XCUIApplication, named name: String) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    @MainActor
    func testHomeScreen() throws {
        let app = launch()
        XCTAssertTrue(app.navigationBars["Stillsmith"].waitForExistence(timeout: 60))
        capture(app, named: "home")
    }

    @MainActor
    func testSettingsScreen() throws {
        let app = launch()
        let settings = app.buttons["Settings"]
        XCTAssertTrue(settings.waitForExistence(timeout: 60))
        settings.tap()
        XCTAssertTrue(app.navigationBars["Settings"].waitForExistence(timeout: 60))
        capture(app, named: "settings")
    }

    @MainActor
    func testTutorialScreen() throws {
        let app = launch(onboardingSeen: false)
        XCTAssertTrue(app.buttons["Continue"].waitForExistence(timeout: 60))
        capture(app, named: "tutorial")
    }
}
