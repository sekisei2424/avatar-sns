import ChatWindow from '@/components/messages/ChatWindow';

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const conversationId = (await params).id;

    return (
        <div className="h-full">
            <ChatWindow conversationId={conversationId} />
        </div>
    );
}
