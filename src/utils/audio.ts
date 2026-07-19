let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** 在用户手势（点击开始）时预创建 AudioContext，确保后续提示音可播放 */
export function primeAudio(): void {
  getContext()
}

function tone(ac: AudioContext, freq: number, start: number, duration: number): void {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

/** 阶段切换提示音（WebAudio 合成，无音频资源文件） */
export function playChime(): void {
  const ac = getContext()
  if (!ac) return
  const now = ac.currentTime
  tone(ac, 880, now, 0.18)
  tone(ac, 1174.66, now + 0.2, 0.28)
}