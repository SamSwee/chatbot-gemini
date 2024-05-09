import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css'; 

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showQuickResponses, setShowQuickResponses] = useState(true);

    const sendMessage = async (message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        setShowQuickResponses(false);

        const newMessage = { id: Date.now(), text: trimmedMessage, sender: 'user' };
        setMessages(messages => [...messages, newMessage]);
        setInput('');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: trimmedMessage }),
        });
        const { reply } = await response.json();
        const formattedReply = formatText(reply);

        // Adding the AI response to the chat
        setMessages(messages => [...messages, { id: Date.now() + 1, text: formattedReply, sender: 'bot' }]);
    };

    const formatText = (text) => {
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
        // Replace lone asterisks used for lists and convert to HTML list items
        formattedText = formattedText.split('\n').map(line => {
            // Match lines that start with a single '*' and replace with list item tags
            if (line.trim().startsWith('* ')) {
                return `<li>${line.trim().substring(2)}</li>`;  // Remove '* ' and wrap the rest in <li> tags
            }
            return line;
        }).join('\n');

        // Wrap all <li> tags with <ul> only if <li> exists in the text
        if (formattedText.includes('<li>')) {
            formattedText = `<ul>${formattedText}</ul>`;
        }

        return formattedText;
    };

    const renderMessage = (msg) => {
        if (msg.sender === 'bot') {
            return <p key={msg.id} className={styles.botMessage} dangerouslySetInnerHTML={{ __html: msg.text }}></p>;
        } else {
            return <p key={msg.id} className={styles.userMessage}>{msg.text}</p>;
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          sendMessage(input);
          e.preventDefault();
      }
  };

    const quickResponse = (text) => {
        sendMessage(text);
        setShowQuickResponses(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatArea}>
                {messages.map(msg => renderMessage(msg))}
                {showQuickResponses && (
                    <div className={styles.quickResponses}>
                        <button onClick={() => quickResponse('Hello!')}>Hello</button>
                        <button onClick={() => quickResponse('Give a quick tip for a developer')}>Quick Tip</button>
                        <button onClick={() => quickResponse('Tell me a joke!')}>Tell a Joke</button>
                    </div>
                )}
            </div>
            <div className={styles.controls}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />
                <button onClick={() => sendMessage(input)} className={styles.sendButton}>Send</button>
            </div>
        </div>
    );
}
