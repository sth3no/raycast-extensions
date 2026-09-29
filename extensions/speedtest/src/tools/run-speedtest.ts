import { ActivitySpeedQualityBandwidth } from "../components/bandwidth/thresholds";
import { convertBitsToMbps, speedToAvailableActivityQuality } from "../components/bandwidth/utils";
import { ensureCLI } from "../lib/cli";
import { runSpeedTestOnce } from "../lib/speedtest";
import { speedToString } from "../lib/utils";

/** Run a new Ookla speed test and return the final connection measurements. */
export default async function runSpeedtest() {
  await ensureCLI();

  const result = await runSpeedTestOnce();

  // Same thresholds as the Voice Call / Video Call / Streaming rows in the command,
  // so the AI's answer matches what the user sees there.
  const speedMbps = {
    download: convertBitsToMbps(result.download.bandwidth),
    upload: convertBitsToMbps(result.upload.bandwidth),
  };

  return {
    download: speedToString(result.download.bandwidth),
    upload: speedToString(result.upload.bandwidth),
    pingMs: result.ping.latency,
    jitterMs: result.ping.jitter,
    packetLossPercent: result.packetLoss,
    isp: result.isp,
    server: `${result.server.name}, ${result.server.location}`,
    resultUrl: result.result.url,
    supportedQualities: {
      voiceCall: speedToAvailableActivityQuality(speedMbps, ActivitySpeedQualityBandwidth.voiceCall),
      videoCall: speedToAvailableActivityQuality(speedMbps, ActivitySpeedQualityBandwidth.videoCall),
      streaming: speedToAvailableActivityQuality(speedMbps, ActivitySpeedQualityBandwidth.stream),
    },
  };
}
