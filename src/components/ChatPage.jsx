import React, { useRef, useState, useEffect } from "react";
import { VscSend } from "react-icons/vsc";
import { VscAttach } from "react-icons/vsc";
//import {useRef ,useState } from "react";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import { toast } from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo }   from "../config/helper";




const ChatPage = () => {

const {roomId, currentUser,connected,setConnected,setRoomId,setCurrentUser} = useChatContext();
// console.log(roomId);
// console.log(currentUser);
// console.log(connected);

const navigate=useNavigate();
useEffect(()=> {
    if(!connected){
        navigate("/");
    }
}, [roomId, currentUser, connected]);

const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const inputRef = useRef(null);
const chatboxRef = useRef(null);
const [stompClient, setStompClient] = useState(null);



// Page Initialization:

// Message load korate hobe

useEffect(() => {
    async function loadMessages() {
        if (!roomId) return;
        try {
            const messages = await getMessages(roomId);
            setMessages(messages);
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    }
    if(connected){
        loadMessages();
    }
}, [roomId]);

//scroll down korar jonne 
useEffect(()=>{

    if(chatboxRef.current){
        chatboxRef.current.scroll({
            top:chatboxRef.current.scrollHeight,
            behavior:"smooth",
        })
    }
},[messages]);


// stompClint initialize korate hobe
    // subscribe korate hobe

    useEffect(() => {
    const client = Stomp.over(() => new SockJS(`${baseURL}/chat`));

    client.connect({}, () => {
        setStompClient(client);
        //toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
            const newMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
        });
    });
    
    return () => {
        if (client && client.connected) {
            client.disconnect(() => console.log("Disconnected"));
        }
    };


}, [roomId]);

// Send message handel

const sendMessage = async () => {

    if(stompClient && connected && input.trim()) {
       console.log(input);
        
        const message = {
            sender: currentUser,
            content: input,
            roomId: roomId
        
        };

        stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message));

        setInput("");
        
    }
};

// Logout handler
function handleLogout() {
        if (stompClient && stompClient.connected) {
            stompClient.disconnect(() => {
                toast.error("You left the room");
                setConnected(false);
                setRoomId("");
                setCurrentUser("");
                navigate("/");
            });
        }
    }



  return <div className="">
    {/* Header Section */}
    <header className="dark:border-gray-700 h-20 fixed w-full dark:bg-gray-900 py-4 shadow flex justify-around items-center">
        <div >
            <h1 className="text-xl font-semibold">Chat ID : <span>{roomId}</span></h1>
        </div>
        <div>
            <h1 className="text-xl font-semibold"> <img className="h-10 w-10 " src="https://avatar.iran.liara.run/public" alt="" /> <span>{currentUser}</span></h1>
        </div>
        <div>
            <button onClick={handleLogout} className="dark:bg-red-400 dark:hover:bg-red-600 px-3 py-2 rounded-2xl">
                Leave Chat
                </button>
        </div>
    </header>

    {/* Chat Container */}
    <main ref={chatboxRef} className="py-20 px-10 w-4/5 dark:bg-slate-500 mx-auto h-screen overflow-auto">
   {messages.map((message,index)  => (
    <div key={index} className={`flex ${message.sender===currentUser ? "justify-end" : "justify-start"}`}>
        <div  className={`my-2 ${message.sender===currentUser?"bg-purple-700":"bg-blue-500"} p-2 max-w-xs rounded-2xl`}>
        <div className="flex flex-row gap-2">
            <img className="h-10 w-10" src="https://avatar.iran.liara.run/public" alt="" />
            <div className="flex flex-col gap-1">
            <p className="text-sm font-bold">{message.sender}</p>
            <p>{message.content}</p>
            <p className="text-xs text-gray-400">{timeAgo(message.timeStamp)}</p>
        </div>
        </div>

       </div>
       </div>
    ))}
    </main>

    {/* Input Messsage Container */}
    <div className="fixed bottom-4  w-full h-16">
        <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full  w-2/3 mx-auto  dark:bg-gray-900">
            <input 
            value={input}
            onChange={(e) => {setInput(e.target.value);
            }}
            onKeyDown={(e)=>{
                if(e.key==="Enter"){
                    sendMessage();
                }
            }}

            type="text" 
            placeholder="Type your message here..." 
            className="w-full dark:border-grey-600 dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none " />
            <div className="flex gap-4">
                <button className="dark:bg-grey-600 h-10 w-10 justify-center items-center rounded-full">
                <VscAttach size={30}/>
            </button>
                <button onClick={sendMessage} className="dark:bg-grey-600 h-10 w-10 justify-center items-center rounded-full">
                <VscSend size={30}/>
            </button>
            </div>
        </div>
    </div>
  </div>
};

export default ChatPage;