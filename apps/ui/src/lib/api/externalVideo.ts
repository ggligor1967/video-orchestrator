import { api } from "./client";

export interface ProcessVideoOptions {
  method: "pictory" | "kapwing" | "local" | "hybrid";
  script?: string;
  name?: string;
  voiceId?: string;
  aspectRatio?: string;
  brandKit?: any;
  backgroundPath?: string;
  audioPath?: string;
  subtitles?: string;
  captionStyle?: string;
  duration?: number;
}

export interface ProcessVideoResult {
  success: boolean;
  videoPath: string;
  method: string;
  jobId?: string;
  projectId?: string;
  processingTime: number;
}

export const externalVideoApi = {
  async processVideo(
    options: ProcessVideoOptions,
  ): Promise<ProcessVideoResult> {
    const response = await api
      .post("external-video/process", { json: options })
      .json<any>();
    return response.data;
  },

  async batchProcess(videos: any[], method = "kapwing"): Promise<any> {
    const response = await api
      .post("external-video/batch", { json: { videos, method } })
      .json<any>();
    return response.data;
  },

  async getEstimate(method: string): Promise<any> {
    const response = await api
      .get(`external-video/estimate/${method}`)
      .json<any>();
    return response.data;
  },

  async searchStockFootage(query: string, count = 10): Promise<any> {
    const response = await api
      .post("external-video/pictory/stock-search", {
        json: { query, count },
      })
      .json<any>();
    return response.data;
  },

  async smartResize(videoUrl: string, targetRatio = "9:16"): Promise<any> {
    const response = await api
      .post("external-video/kapwing/smart-resize", {
        json: { videoUrl, targetRatio },
      })
      .json<any>();
    return response.data;
  },
};
