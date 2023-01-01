import type { NextApiRequest, NextApiResponse } from "next";
import s3 from "../../src/lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!req.body.filename) {
    res.status(400).json({ error: "Missing filename" });
    return;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    Key: req.body.filename,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  res.status(200).json({ url });
};

export default handler;
