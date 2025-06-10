import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

async function loadFFmpeg() {
  try {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

    const ffmpeg = new FFmpeg();

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    return ffmpeg;
  } catch (error) {
    console.error("Error loading FFmpeg:", error);
    return null;
  }
}

export type ExtractedMedia = {
  video: Blob;
  audio: Blob;
  wav: Blob;
};

export async function extractMediaElements(
  videoBlob: Blob
): Promise<ExtractedMedia> {
  const ffmpeg = await loadFFmpeg();

  if (!ffmpeg) return { video: videoBlob, audio: new Blob(), wav: new Blob() };

  // Write the video blob to FFmpeg's virtual filesystem
  ffmpeg.writeFile("input.webm", await fetchFile(videoBlob));

  // Extract audio as mp3
  await ffmpeg.exec([
    "-i",
    "input.webm",
    "-vn",
    "-acodec",
    "libmp3lame",
    "output.mp3",
  ]);

  // Extract audio as 16kHz mono wav (PCM)
  await ffmpeg.exec([
    "-i",
    "input.webm",
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-f",
    "wav",
    "output.wav",
  ]);

  // Read the files back from FFmpeg's virtual filesystem
  const audioMp3Data = await ffmpeg.readFile("output.mp3");
  const audioWavData = await ffmpeg.readFile("output.wav");

  // Clean up
  await ffmpeg.deleteFile("input.webm");
  await ffmpeg.deleteFile("output.mp3");
  await ffmpeg.deleteFile("output.wav");

  return {
    video: videoBlob,
    audio: new Blob([audioMp3Data], { type: "audio/mp3" }),
    wav: new Blob([audioWavData], { type: "audio/wav" }),
  };
}
