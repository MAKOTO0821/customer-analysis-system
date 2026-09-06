import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

export const registerSchema = z.object({
  username: z
    .string()
    .regex(usernamePattern, "ユーザー名は英数字とアンダースコアで3〜20文字にしてください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください").max(100),
  displayName: z.string().trim().min(1, "表示名を入力してください").max(50),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, "表示名を入力してください").max(50).optional(),
  bio: z.string().max(160, "自己紹介は160文字以内にしてください").optional(),
  avatarUrl: z
    .union([z.string().url("有効なURLを入力してください"), z.literal("")])
    .optional(),
  isPrivate: z.boolean().optional(),
});

export const tweetSchema = z.object({
  content: z.string().trim().min(1, "投稿内容を入力してください").max(280, "280文字以内で入力してください"),
  parentId: z.string().optional(),
});
