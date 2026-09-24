import { loadAchievements, computeCurrentStreak } from './achievementController.js'
import { STORAGE_KEYS, CHALLENGE_STREAKS } from '../../core/constants.js'
import { storage } from '../../core/storage.js'

const INITIAL_POINTS = 0

function loadPoints() {
  return storage.getJSON(STORAGE_KEYS.points) ?? INITIAL_POINTS
}

export function getPoints() {
  return loadPoints()
}

export function grantPoints(points) {
  storage.setJSON(STORAGE_KEYS.points, loadPoints() + points)
}

export function challengeViews() {
  const streak = computeCurrentStreak()
  return CHALLENGE_STREAKS.map((days) => ({
    days,
    progress: Math.min(streak, days),
    completed: streak >= days,
    goal: days
  }))
}

export function loadClaimed() {
  return storage.getJSON(STORAGE_KEYS.claimedChallenges) || []
}

export function isClaimed(days) {
  return loadClaimed().includes(days)
}

export function claimChallenge(days) {
  if (storage.getJSON(STORAGE_KEYS.claimedChallenges)?.includes(days)) return false
  const claimed = loadClaimed()
  claimed.push(days)
  storage.setJSON(STORAGE_KEYS.claimedChallenges, claimed)
  grantPoints(50)
  return true
}
