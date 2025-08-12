import React, { memo } from "react";
import { Box, Typography, Avatar, AvatarGroup } from "@mui/material";
import { motion } from "framer-motion";

type TypingUser = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

type Props = {
  typingUsers?: TypingUser[]; // list of users currently typing
  maxAvatars?: number; // how many avatars to show before collapsing
  sx?: any;
};

const dotVariants = {
  hidden: { y: 0, opacity: 0.2 },
  visible: (i: number) => ({
    y: [0, -4, 0],
    opacity: [0.2, 1, 0.2],
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
};

/**
 * TypingIndicator
 *
 * Usage:
 * <TypingIndicator typingUsers={[{id:'u1', username:'Alice'}]} />
 *
 * Expects the websocket hook to pass a list of currently typing users.
 */
function TypingIndicatorInner({ typingUsers = [], maxAvatars = 3, sx }: Props) {
  if (!typingUsers || typingUsers.length === 0) return null;

  const showUsers = typingUsers.slice(0, maxAvatars);
  const remaining = typingUsers.length - showUsers.length;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing…`
      : typingUsers.length === 2
      ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing…`
      : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing…`;

  return (
    <Box
      component="aside"
      aria-live="polite"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
        alignSelf: "start",
        ...sx,
      }}
    >
      {/* Avatars */}
      <AvatarGroup max={maxAvatars} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 12 } }}>
        {showUsers.map((u) => (
          <Avatar key={u.id} alt={u.username} src={u.avatarUrl ?? undefined}>
            {u.username?.charAt(0)?.toUpperCase() ?? "?"}
          </Avatar>
        ))}
        {remaining > 0 && <Avatar>+{remaining}</Avatar>}
      </AvatarGroup>

      {/* Text + Animated dots */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 120 }}>
          {label}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", ml: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={dotVariants}
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "currentColor",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const TypingIndicator = memo(TypingIndicatorInner);
TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
