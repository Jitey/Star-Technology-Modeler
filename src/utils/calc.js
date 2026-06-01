/**
 * Core calculation engine for Star Technology Modeler
 *
 * Machine effective cycle time:
 *   effectiveCycleTime = recipe.cycleTime * machine.timeMultiplier / machine.speedMultiplier
 *
 * Per machine instance throughput for an output:
 *   outputPerSecond = (output.amount * (output.probability/100) * parallelSlots) / effectiveCycleTime
 *
 * Total throughput for N machines:
 *   totalThroughput = outputPerSecond * machine.count
 *
 * Machines needed to hit a target rate:
 *   machinesNeeded = ceil(targetRatePerSecond / outputPerSecond)
 */

export function getMachineEffectiveCycleTime(recipe, machine) {
  if (!recipe || !machine) return null
  return (recipe.cycleTime * machine.timeMultiplier) / machine.speedMultiplier
}

export function getOutputThroughput(recipe, machine, output) {
  const cycleTime = getMachineEffectiveCycleTime(recipe, machine)
  if (!cycleTime || cycleTime <= 0) return 0
  const perCycle = output.amount * (output.probability / 100) * machine.parallelSlots
  return perCycle / cycleTime
}

export function getTotalThroughput(recipe, machine, output) {
  return getOutputThroughput(recipe, machine, output) * machine.count
}

export function getInputConsumptionRate(recipe, machine, input) {
  const cycleTime = getMachineEffectiveCycleTime(recipe, machine)
  if (!cycleTime || cycleTime <= 0) return 0
  return (input.amount * machine.parallelSlots * machine.count) / cycleTime
}

export function getMachinesNeeded(recipe, machine, output, targetRatePerSecond) {
  const perMachine = getOutputThroughput(recipe, machine, output)
  if (!perMachine || perMachine <= 0) return null
  return Math.ceil(targetRatePerSecond / perMachine)
}

export function toPerSecond(rate, unit) {
  switch (unit) {
    case 'per_second': return rate
    case 'per_minute': return rate / 60
    case 'per_hour': return rate / 3600
    case 'per_cycle': return rate // handled differently
    default: return rate
  }
}

export function formatRate(ratePerSecond) {
  if (ratePerSecond === null || ratePerSecond === undefined) return '—'
  if (ratePerSecond >= 1) return `${ratePerSecond.toFixed(3)}/s`
  if (ratePerSecond >= 1 / 60) return `${(ratePerSecond * 60).toFixed(2)}/min`
  return `${(ratePerSecond * 3600).toFixed(1)}/h`
}

export function formatNumber(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return Number(n.toFixed(decimals)).toString()
}

export function getUtilization(recipe, machine, output, targetRatePerSecond) {
  const total = getTotalThroughput(recipe, machine, output)
  if (!total) return null
  return (targetRatePerSecond / total) * 100
}
