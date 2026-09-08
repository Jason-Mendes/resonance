import { PodcastEpisode } from "@/types/podcast";
import { HOST_PAIR_PRESETS } from "./sample-podcast-hosts";

export const SAMPLE_PODCAST_MAP: Record<string, PodcastEpisode> = {
  "sovereign-compute-2026": {
    id: "ep-sovereign-compute",
    articleId: "sovereign-compute-2026",
    showName: "Analysis",
    title: "The Sovereign Compute Illusion",
    subtitle: "Can Europe legislate its way out of the AI semiconductor stack?",
    hosts: HOST_PAIR_PRESETS[0].hosts,
    format: "dialogue",
    durationSeconds: 340,
    formattedDuration: "5m 40s",
    waveform: [15, 35, 60, 40, 85, 95, 70, 50, 80, 65, 45, 90, 75, 55, 30, 65, 80, 50, 30, 15],
    chapters: [
      {
        id: "c1",
        time: 0,
        formattedTime: "0:00",
        title: "Introduction",
        summary: "Host 1 and Host 2 review sovereign cloud data centers.",
      },
      {
        id: "c2",
        time: 75,
        formattedTime: "1:15",
        title: "Silicon Dependency",
        summary: "Hardware supply chain realities.",
      },
      {
        id: "c3",
        time: 180,
        formattedTime: "3:00",
        title: "Edge Silicon",
        summary: "Pivoting to specialized robotics chips.",
      },
    ],
    dialogue: [
      {
        id: "t1",
        speaker: "Host 1",
        speakerRole: "Host 1",
        timestamp: "0:00",
        timeSeconds: 0,
        text: "Over the last eighteen months, practically every European tech minister has cut a ribbon on a sovereign cloud data center. But our investigation suggests this might be an administrative illusion.",
      },
      {
        id: "t2",
        speaker: "Host 2",
        speakerRole: "Host 2",
        timestamp: "0:25",
        timeSeconds: 25,
        text: "That's exactly right, Host 1. The fundamental problem is that data sovereignty and compute sovereignty are completely different animals. 92.4% of the silicon doing the actual training is manufactured abroad.",
      },
      {
        id: "t3",
        speaker: "Host 1",
        speakerRole: "Host 1",
        timestamp: "1:15",
        timeSeconds: 75,
        text: "And that ties directly to the report from ETH Zurich: 'If your tensor cores are subject to foreign export controls, your sovereignty is a fiction.'",
      },
      {
        id: "t4",
        speaker: "Host 2",
        speakerRole: "Host 2",
        timestamp: "1:48",
        timeSeconds: 108,
        text: "Precisely. Replicating multi-billion-dollar fabs is impossible on a five-year horizon. The real strategic divergence is specialized neuromorphic edge silicon.",
      },
    ],
    showNotes:
      "Host 1 and Host 2 unpack the European sovereign AI push, analyzing why data localization fails without domestic semiconductor fabrication.",
    keyTakeaways: [
      "92.4% of continental AI training clusters depend on foreign silicon supply chains.",
      "Data localization directives cannot override hardware export restrictions.",
      "Asymmetric advantage lies in domain-specific edge architectures.",
    ],
  },
  "alpine-water-battery": {
    id: "ep-alpine-battery",
    articleId: "alpine-water-battery",
    showName: "Analysis",
    title: "Thunder Inside the Granite",
    subtitle: "How 900 megawatts of subterranean pumped hydro stabilize the continent.",
    hosts: HOST_PAIR_PRESETS[0].hosts,
    format: "dialogue",
    durationSeconds: 280,
    formattedDuration: "4m 40s",
    waveform: [20, 45, 70, 55, 80, 90, 65, 45, 85, 70, 60, 40, 75, 85, 60, 40, 30, 50, 35, 20],
    chapters: [
      {
        id: "ac1",
        time: 0,
        formattedTime: "0:00",
        title: "Subterranean Martigny",
        summary: "Inside the mountain cavern.",
      },
      {
        id: "ac2",
        time: 80,
        formattedTime: "1:20",
        title: "The 900MW Ramp",
        summary: "Absorbing volatile wind and solar spikes.",
      },
    ],
    dialogue: [
      {
        id: "at1",
        speaker: "Host 1",
        speakerRole: "Host 1",
        timestamp: "0:00",
        timeSeconds: 0,
        text: "Six hundred meters inside the bedrock of the Valais Alps sits Europe's most indispensable mechanical insurance policy: Nant de Drance.",
      },
      {
        id: "at2",
        speaker: "Host 2",
        speakerRole: "Host 2",
        timestamp: "0:22",
        timeSeconds: 22,
        text: "What makes it astonishing is the ramp speed. It can jump from dead standstill to 900 megawatts in under five minutes when regional wind generation drops off.",
      },
    ],
    showNotes:
      "A deep dive into Nant de Drance and how pumped-storage hydroelectricity acts as Europe's primary renewable shock absorber.",
    keyTakeaways: [
      "900 megawatts of instantaneous grid balancing capability.",
      "Rapid sub-5-minute ramp speed protects against renewable intermittency.",
    ],
  },
};
