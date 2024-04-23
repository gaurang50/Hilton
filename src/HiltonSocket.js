import React, { useState, useEffect, useRef } from 'react';
import './HiltonSocket.css'; // Import CSS file for styling

function HiltonSocket() {
    const [messages, setMessages] = useState([]);
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [userInput, setUserInput] = useState("");
    const wsRef = useRef(null);

    useEffect(() => {
        wsRef.current = new WebSocket("wss://apps.aiassistant.co:4005/");

        wsRef.current.onopen = () => {
            const initMessage = {
                type: "init",
                productId: "hiltonloscabos",
                channel: "web",
            };
            wsRef.current.send(JSON.stringify(initMessage));
            setTimeout(() => {
                QuerySimulator(wsRef.current);
            }, 1000);
        };
        wsRef.current.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);

            if (parsedMessage?.type === "start" && parsedMessage?.text) {
                setWelcomeMessage(parsedMessage.text);
            } else if (parsedMessage?.type === "text" || parsedMessage?.type === "query") {

                setMessages(prevMessages => [...prevMessages, { type: parsedMessage.type, text: parsedMessage.text.trim() }]);
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
                summary: false,
            };
            wsRef.current.send(JSON.stringify(queryMessage));
            setMessages(prevMessages => [...prevMessages, { type: 'user', text: userInput }]);
            setUserInput(""); // Clear input after sending
        } else {
            console.error('WebSocket is not open.');
        }
    };

    return (
        <div className="chat-container">
            <h1>WebSocket Messages</h1>
            <div className="welcome-box">
                <p className="welcome-message">{welcomeMessage}</p>
            </div>
            <div className="chat-box">
                <div className="conversation">
                    <div className="messages">
                       
                        <p className="message ai-message">
                            {messages.filter(message => message.type === "text" || message.type === "query")
                                .map(message => message.text)
                                .join(" ")}
                        </p>
                        
                        {messages.filter(message => message.type === "user")
                            .map((message, index) => (
                                <p key={index} className="message user-message">
                                    {message.text}
                                </p>
                            ))}
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

function QuerySimulator(ws) {
    const userQuestions = [
        "Is there housekeeping service?",
        "Is there any airport nearby?",
    ];

    userQuestions.forEach((question, i) => {
        setTimeout(() => {
            const queryMessage = {
                type: "query",
                productId: "hiltonloscabos",
                text: question,
                summary: false,
            };
            ws.send(JSON.stringify(queryMessage));
        }, 3000 * i);
    });
}

export default HiltonSocket;
