import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";

export default function MealMateChatScreen({ route }) {
  const room = route.params?.room ?? {
    title: "나랑 밥먹자",
    topic: "편하게 밥 먹기",
    time: "시간 협의",
    members: 1,
    maxCount: 3,
  };
  const initialMessages = useMemo(
    () => [
      {
        id: "message-1",
        sender: "익명 방장",
        message: `${room.time}에 ${room.title}에서 만나는 걸로 생각하고 있어요.`,
      },
      {
        id: "message-2",
        sender: "익명 02",
        message: "좋아요. 도착하면 여기 채팅으로 알려주세요.",
      },
    ],
    [room.time, room.title],
  );
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const sendMessage = () => {
    const text = draft.trim();

    if (!text) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `local-message-${Date.now()}`,
        sender: "익명 나",
        message: text,
      },
    ]);
    setDraft("");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.roomHeader}>
        <Text style={styles.eyebrow}>익명 채팅방</Text>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.meta}>
          {room.time} · {room.topic} · {room.members}/{room.maxCount}명
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.messageList}>
        {messages.map((message) => {
          const isMe = message.sender === "익명 나";

          return (
            <View key={message.id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
              <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
                <Text style={[styles.sender, isMe && styles.senderMe]}>{message.sender}</Text>
                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{message.message}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

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
    margin: 18,
    marginBottom: 8,
    padding: 18,
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
  messageList: {
    paddingHorizontal: 18,
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
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sendButton: {
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
