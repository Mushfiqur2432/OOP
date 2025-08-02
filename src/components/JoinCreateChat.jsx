import React, {useRef,useState } from "react";
import chatIcon from"../assets/chat.png"; // Assuming you have a chat icon image
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi} from "../services/RoomService"; // Import the createRoom service
import useChatContext from "../context/ChatContext";
import { Await, useNavigate } from "react-router";
const JoinCreateChat = () => {

    const[detail,setDetail] = useState({
      roomId:"",
      userName:"",
    });
    
   const {roomId,userName,setRoomId,setCurrentUser,setConnected}=useChatContext();
   const navigate=useNavigate();

    function handleFromInputChange(event){
        setDetail({
            ...detail,
            [event.target.name]: event.target.value,
        });
    }

    function validateFrom(){
        if(detail.roomId === "" || detail.userName === ""){
          toast.error("Invalid Input !!");
            return false;
        }
        return true;
    }

    async function joinChat(){
      if(validateFrom()){
        //join chat
        
        try {
          
          const room = await joinChatApi(detail.roomId)
        toast.success("Joined Successfully");
          setCurrentUser(detail.userName);
          setRoomId(room.roomId);
          setConnected(true);
          navigate("/chat");

        } catch (error) {
          if(error.status === 404){
            toast.error(error.response.data);
          } else{
            toast.error("Error Room Not Found, Please Check The Room ID.");
          }
          console.log(error);
        }
      }

    }

    async function createRoom(){
      if(validateFrom()){
        //create room
        console.log(detail);
        //call api to create backend
        try{
          const response = await createRoomApi(detail.roomId);
          console.log(response);
          toast.success("Room Created Successfully");
          //Join the room after creation
          setCurrentUser(detail.userName);
          setRoomId(response.roomId);
          setConnected(true);
          
          navigate("/chat"); // Redirect to chat page after room creation

          // forward to chat page
        }catch(error){
          console.log(error);
          if(error.response && error.response.status === 400){
            toast.error("Room ID already exists, please try another one.");
          } else {
            toast("Error in creating room, please try again later.");
          }  
        }
      }
    }


    return (
        <div className="min-h-screen flex items-center justify-center"> 
          <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
            
            <div>
                <img src={chatIcon} className="w-25 mx-auto"/>
            </div>



            <h1 className="text-2xl font-semibold text-center ">
                Join Chat / Create Chat
            </h1>
            {/* Name Div */}
            <div className="">
                <label htmlFor="name" className="block font-medium mb-2">Your name
                </label>
                <input 
                 onChange={handleFromInputChange}
                 value={detail.userName}
                type="text"
                  id="name"
                  name="userName"
                  placeholder="Enter Your Name"
                  className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>
            {/* Room ID Div */}
            <div className="">
                <label htmlFor="name" className="block font-medium mb-2">
                  Chat ID / New Chat ID
                  </label>
                <input
                name="roomId"
                onChange={handleFromInputChange}
                value={detail.roomId}
                 type="text"
                  id="name"
                  placeholder="Enter the chat ID"
                  className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>

            {/* Button Div */}
            <div className="flex justify-center gap-2 mt-4">
                <button onClick={joinChat} className="px-3 py-2 dark:bg-purple-800 hover:bg-purple-900 rounded-2xl">
                Join Chat
                </button>
                <button onClick={createRoom} className="px-3 py-2 dark:bg-purple-800 hover:bg-purple-900 rounded-2xl">
                Create Chat
                </button>
            </div>
          </div>    
        
        
        </div>
    );
};

export default JoinCreateChat;
