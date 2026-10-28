//
//  MarkingTests.swift
//  StillsmithTests
//

import AVFoundation
import Testing
@testable import Stillsmith

@MainActor
@Suite("Marking")
struct MarkingTests {

    private func makeManager() -> VideoManager {
        let manager = VideoManager()
        manager.selectVideo(url: URL(fileURLWithPath: "/tmp/clip.mov"))
        return manager
    }

    private func time(_ seconds: Double) -> CMTime {
        CMTime(seconds: seconds, preferredTimescale: 600)
    }

    @Test("Marking the playhead adds a frame")
    func marksFrame() {
        let manager = makeManager()
        manager.toggleMark(at: time(4.2))
        #expect(manager.markedFrames.count == 1)
    }

    @Test("Marking the same moment again removes the mark")
    func togglesSameMoment() {
        let manager = makeManager()
        manager.toggleMark(at: time(4.2))
        manager.toggleMark(at: time(4.2))
        #expect(manager.markedFrames.isEmpty)
    }

    @Test("A moment far enough away is a second mark")
    func nearbyMomentAddsAnotherFrame() {
        let manager = makeManager()
        manager.toggleMark(at: time(4.2))
        manager.toggleMark(at: time(4.5))
        #expect(manager.markedFrames.count == 2)
    }

    @Test("Removing one mark leaves the rest")
    func removesSingleMark() throws {
        let manager = makeManager()
        manager.toggleMark(at: time(1))
        manager.toggleMark(at: time(2))
        let first = try #require(manager.markedFrames.first)
        manager.unmarkFrame(id: first.id)
        #expect(manager.markedFrames.count == 1)
        #expect(manager.markedFrames.first?.seconds != first.seconds)
    }

    @Test("Clearing removes every mark")
    func clearsAllMarks() {
        let manager = makeManager()
        manager.toggleMark(at: .zero)
        manager.toggleMark(at: time(3))
        manager.clearMarkedFrames()
        #expect(manager.markedFrames.isEmpty)
    }
}
