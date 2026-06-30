import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getParticipantKey } from "../services/clientIdentity";
import {
  createMealMateMessage,
  fetchMealMateMessages,
  type MealMateMessageDto,
} from "../services/mealMateApi";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  isMe: boolean;
};

function mapMessage(message: MealMateMessageDto): ChatMessage {
  return {
    id: message.id,
    sender: message.anonymousLabel,
    message: message.body,
    isMe: message.isMine,
  };
}

export default function MealMateChatScreen({ route }: AppScreenProps<"MealMateChat">) {
  const room = route.params?.room ?? {
    id: "",
    title: "나랑 밥먹자",
    topic: "편하게 밥 먹기",
    time: "시간 협의",
    members: 1,
    maxCount: 3,
  };
  const participantKey = useMemo(() => getParticipantKey(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [serverError, setServerError] = useState("");

  const loadMessages = useCallback(async () => {
    if (!room.id) {
      return;
    }

    try {
      const serverMessages = await fetchMealMateMessages(room.id, participantKey);
      setMessages(serverMessages.map(mapMessage));
      setServerError("");
    } catch {
      setServerError("채팅 서버 연결을 확인하고 있어요");
    }
  }, [participantKey, room.id]);

  useEffect(() => {
    loadMessages();
    const timerId = setInterval(loadMessages, 3000);
    return () => clearInterval(timerId);
  }, [loadMessages]);

  const sendMessage = async () => {
    const text = draft.trim();

    if (!text || !room.id) {
      return;
    }

    const optimisticId = `local-message-${Date.now()}`;
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: optimisticId,
        sender: "익명 나",
        message: text,
        isMe: true,
      },
    ]);
    setDraft("");

    try {
      const savedMessage = await createMealMateMessage(room.id, {
        body: text,
        participantKey,
      });
      setMessages((currentMessages) => [
        ...currentMessages.filter((message) => message.id !== optimisticId),
        {
          id: savedMessage.id,
          sender: savedMessage.anonymousLabel,
          message: savedMessage.body,
          isMe: true,
        },
      ]);
      setServerError("");
    } catch {
      setServerError("메시지 전송에 실패했어요");
    }
  };

  const renderMessage = useCallback(
    ({ item: message }: { item: ChatMessage }) => (
      <View style={[styles.messageRow, message.isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, message.isMe && styles.messageBubbleMe]}>
          <Text style={[styles.sender, message.isMe && styles.senderMe]}>{message.isMe ? "나" : message.sender}</Text>
          <Text style={[styles.messageText, message.isMe && styles.messageTextMe]}>{message.message}</Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.roomHeader}>
        <Text style={styles.eyebrow}>익명 채팅방</Text>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.meta}>
          {room.time} · {room.topic} · {room.members}/{room.maxCount}명
        </Text>
      </View>

      {serverError ? (
        <View style={styles.serverNotice}>
          <Text style={styles.serverNoticeText}>{serverError}</Text>
        </View>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={renderMessage}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.messageList}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="익명으로 메시지 보내기"
          placeholderTextColor={colors.textSoft}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>전송</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  roomHeader: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#eaf7fc",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 23,
    fontWeight: "900",
  },
  meta: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  serverNotice: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  serverNoticeText: {
    color: "#c2410c",
    fontSize: 12,
    fontWeight: "900",
  },
  messageList: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  messageRow: {
    alignItems: "flex-start",
  },
  messageRowMe: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "82%",
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sender: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  senderMe: {
    color: "#d9f4ff",
  },
  messageText: {
    marginTop: 5,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#ffffff",
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sendButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});
