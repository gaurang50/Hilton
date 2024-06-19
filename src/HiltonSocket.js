import React, { useState, useEffect, useRef } from 'react';
import './HiltonSocket.css'; 

function HiltonSocket() {
    const [messages, setMessages] = useState([]);
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [userInput, setUserInput] = useState("");
    const wsRef = useRef(null);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        wsRef.current = new WebSocket("wss://apps.aiassistant.co:4005/");

        wsRef.current.onopen = () => {
            const initMessage = {
                type: "init",
                productId: "hiltonloscabos",
                channel: "web",
            };
            wsRef.current.send(JSON.stringify(initMessage));
        };

        wsRef.current.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);

            if (parsedMessage?.type === "start" && parsedMessage?.text) {
                setWelcomeMessage(parsedMessage.text);
                setSessionId(parsedMessage.session_id);
            } else if (parsedMessage?.type === "text") {
                setMessages(prevMessages => [...prevMessages, { type: 'ai', text: parsedMessage.text }]);
            } else if (parsedMessage?.type === "end") {
                
            }
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        wsRef.current.onclose = (event) => {
            console.log(`Connection closed: ${event.code} ${event.reason}`);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleUserInput = (event) => {
        setUserInput(event.target.value);
    };

    const handleSendMessage = () => {
        if (wsRef.current.readyState === WebSocket.OPEN) {
            const queryMessage = {
                type: "query",
                productId: "hiltonloscabos",
                text: userInput,
                summary: false
            };
            wsRef.current.send(JSON.stringify(queryMessage));
            setMessages(prevMessages => [...prevMessages, { type: 'user', text: userInput }]);
            setUserInput(""); 
        } else {
            console.error('WebSocket is not open.');
        }
    };

    const renderMessages = () => {
        let renderedMessages = [];
        let currentMessage = "";

        messages.forEach((message, index) => {
            if (index === 0 || message.type !== messages[index - 1].type) {
                
                currentMessage = message.text;
                renderedMessages.push(
                    <p key={index} className={`message ${message.type}-message`}>{currentMessage}</p>
                );
            } else {
                currentMessage += "" + message.text;
                renderedMessages[renderedMessages.length - 1] = (
                    <p key={index} className={`message ${message.type}-message`}>{currentMessage}</p>
                );
            }
        });

        return renderedMessages;
    };

    return (
        <div className="chat-container">
            <h1>Hilton Demo</h1>
            <div className="welcome-box">
                <p className="welcome-message">{welcomeMessage}</p>
            </div>
            <div className="chat-box">
                <div className="conversation">
                    <div className="messages">
                        {renderMessages()}
                    </div>
                </div>
                <div className="user-input">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleUserInput}
                        placeholder="Type your message..."
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default HiltonSocket;