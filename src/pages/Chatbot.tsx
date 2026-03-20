import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Camera, Image as ImageIcon, CheckCircle, AlertTriangle, User, Bot, Loader2, Copy } from "lucide-react";
import Webcam from "react-webcam";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: string[];
  isPhotoRequest?: boolean;
  photoData?: string;
  complaintId?: string;
};

export default function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "bot", text: "Hello 👋 Welcome to Smart Campus Complaint Assistant. Type 'Hi' to start." }
  ]);
  const [input, setInput] = useState("");
  const [flowState, setFlowState] = useState("IDLE");
  const [complaintData, setComplaintData] = useState<any>({});
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text: string, options?: string[], isPhotoRequest?: boolean, complaintId?: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9), sender: "bot", text, options, isPhotoRequest, complaintId }]);
  };

  const addUserMessage = (text: string, photoData?: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9), sender: "user", text, photoData }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    addUserMessage(userText);
    setInput("");
    processInput(userText);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    processInput(option);
  };

  const processInput = (text: string) => {
    const lowerText = text.toLowerCase();

    if (flowState === "IDLE") {
      if (lowerText === "hi" || lowerText === "hello") {
        addBotMessage("Please select an option:", [
          "1. File New Complaint",
          "2. Track Complaint Status",
          "3. Give Feedback",
          "4. Contact Admin",
          "5. View Complaint History"
        ]);
        setFlowState("MAIN_MENU");
      } else {
        addBotMessage("I didn't understand. Type 'Hi' to start.");
      }
      return;
    }

    if (flowState === "MAIN_MENU") {
      if (text.includes("1") || lowerText.includes("file")) {
        addBotMessage("Select complaint category:", [
          "1. Hostel",
          "2. Classroom",
          "3. Mess Food",
          "4. Infrastructure",
          "5. Technical Issue",
          "6. Others"
        ]);
        setFlowState("CATEGORY_SELECT");
      } else if (text.includes("2") || lowerText.includes("track")) {
        navigate("/track");
      } else if (text.includes("3") || lowerText.includes("feedback")) {
        navigate("/feedback");
      } else if (text.includes("4") || lowerText.includes("contact")) {
        addBotMessage("Please enter your registered email or a valid Complaint ID to verify your identity.");
        setFlowState("VERIFY_CONTACT");
      } else if (text.includes("5") || lowerText.includes("history")) {
        navigate("/history");
      } else {
        addBotMessage("Invalid option. Please select 1, 2, 3, 4, or 5.");
      }
      return;
    }

    if (flowState === "VERIFY_CONTACT") {
      // Mock verification
      if (text.includes("@") || text.startsWith("CMP-")) {
        addBotMessage("Verification successful. Admin Contact: +1 234 567 8900");
        setFlowState("IDLE");
      } else {
        addBotMessage("Invalid email or Complaint ID. Please try again.");
      }
      return;
    }

    if (flowState === "CATEGORY_SELECT") {
      let category = "";
      if (text.includes("1") || lowerText.includes("hostel")) category = "Hostel";
      else if (text.includes("2") || lowerText.includes("class")) category = "Classroom";
      else if (text.includes("3") || lowerText.includes("mess")) category = "Mess Food";
      else if (text.includes("4") || lowerText.includes("infra")) category = "Infrastructure";
      else if (text.includes("5") || lowerText.includes("tech")) category = "Technical Issue";
      else if (text.includes("6") || lowerText.includes("other")) category = "Others";

      if (category) {
        setComplaintData({ ...complaintData, category });
        if (category === "Hostel") {
          addBotMessage("Please provide your Hostel Block Name (e.g., Block A):");
          setFlowState("HOSTEL_BLOCK");
        } else if (category === "Classroom") {
          addBotMessage("Please provide: Academic Block Name and Classroom Number (e.g., Block B, Room 204)");
          setFlowState("CLASSROOM_DETAILS");
        } else if (category === "Mess Food") {
          addBotMessage("Please provide: Mess Name and Meal Type (Breakfast/Lunch/Snacks/Dinner)");
          setFlowState("MESS_DETAILS");
        } else if (category === "Technical Issue") {
          addBotMessage("Please provide: Lab Name and Computer Number");
          setFlowState("TECH_DETAILS");
        } else if (category === "Infrastructure") {
          addBotMessage("Please provide: Campus Location (e.g., Near Main Gate)");
          setFlowState("INFRA_DETAILS");
        } else {
          addBotMessage("Please describe your issue in detail.");
          setFlowState("ASK_DESCRIPTION");
        }
      } else {
        addBotMessage("Invalid category. Please select from the options.");
      }
      return;
    }

    // Handle specific flow details
    if (flowState === "HOSTEL_BLOCK") {
      setComplaintData({ ...complaintData, hostelBlock: text });
      addBotMessage("Please provide your Floor Number (e.g., 1st Floor):");
      setFlowState("HOSTEL_FLOOR");
      return;
    }

    if (flowState === "HOSTEL_FLOOR") {
      setComplaintData({ ...complaintData, hostelFloor: text });
      addBotMessage("Please provide your Room Number (e.g., 101):");
      setFlowState("HOSTEL_ROOM");
      return;
    }

    if (flowState === "HOSTEL_ROOM") {
      const loc = `${complaintData.hostelBlock}, Floor ${complaintData.hostelFloor}, Room ${text}`;
      setComplaintData({ ...complaintData, locationDetails: loc });
      const options = ["Water Leakage", "Electricity Issue", "Bathroom Issue", "Fan / AC Not Working", "Room Damage", "Others"];
      addBotMessage("Select Problem Type:", options);
      setFlowState("PROBLEM_TYPE");
      return;
    }

    if (["CLASSROOM_DETAILS", "MESS_DETAILS", "TECH_DETAILS", "INFRA_DETAILS"].includes(flowState)) {
      setComplaintData({ ...complaintData, locationDetails: text });
      
      let options: string[] = [];
      if (flowState === "CLASSROOM_DETAILS") options = ["Projector Not Working", "Fan Not Working", "Bench Damage", "Electrical Issue", "Board Damage", "Others"];
      if (flowState === "MESS_DETAILS") options = ["Food Quality Issue", "Hygiene Issue", "Food Not Cooked Properly", "Others"];
      if (flowState === "TECH_DETAILS") options = ["Computer Not Working", "Internet Issue", "Software Issue", "Printer Not Working", "Others"];
      if (flowState === "INFRA_DETAILS") options = ["Broken Road", "Water Leakage", "Street Light Not Working", "Garbage Issue", "Building Damage", "Others"];

      addBotMessage("Select Problem Type:", options);
      setFlowState("PROBLEM_TYPE");
      return;
    }

    const askDescriptionPrompt = (problem: string, category: string) => {
      let prompt = "Please provide a brief description of the issue.";
      if (category === "Hostel") {
        prompt = `Please provide more details about the ${problem} in your hostel room.`;
      } else if (category === "Classroom") {
        prompt = `Please provide more details about the ${problem} in the classroom.`;
      } else if (category === "Mess Food") {
        prompt = `Please provide more details about the ${problem} in the mess.`;
      } else if (category === "Technical Issue") {
        prompt = `Please provide more details about the ${problem} in the lab.`;
      } else if (category === "Infrastructure") {
        prompt = `Please provide more details about the ${problem} on campus.`;
      }
      return prompt;
    };

    if (flowState === "PROBLEM_TYPE") {
      if (lowerText === "others" || lowerText.includes("other") || text === "6") {
        addBotMessage("Please specify the other problem:");
        setFlowState("PROBLEM_TYPE_OTHER");
        return;
      }
      setComplaintData({ ...complaintData, problemType: text });
      addBotMessage(askDescriptionPrompt(text, complaintData.category));
      setFlowState("ASK_DESCRIPTION");
      return;
    }

    if (flowState === "PROBLEM_TYPE_OTHER") {
      setComplaintData({ ...complaintData, problemType: text });
      addBotMessage(askDescriptionPrompt(text, complaintData.category));
      setFlowState("ASK_DESCRIPTION");
      return;
    }

    if (flowState === "ASK_DESCRIPTION") {
      setComplaintData({ ...complaintData, description: text });
      addBotMessage("Please capture a photo for evidence. You can use the camera, upload an image, or skip this step.", undefined, true);
      setFlowState("AWAITING_PHOTO");
      return;
    }

    if (flowState === "AWAITING_PHOTO") {
      addBotMessage("Please upload a photo, open the camera, or click 'Skip Photo'.", undefined, true);
      return;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        addUserMessage("📸 Photo Uploaded", base64String);
        setComplaintData({ ...complaintData, photoURL: base64String });
        submitComplaint(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setShowCamera(false);
      addUserMessage("📸 Photo Captured", imageSrc);
      setComplaintData({ ...complaintData, photoURL: imageSrc });
      submitComplaint(imageSrc);
    } else {
      setShowCamera(false);
      addBotMessage("Failed to capture photo. Please try uploading an image instead.");
    }
  };

  const submitComplaint = async (photoURL: string) => {
    setIsSubmitting(true);
    addBotMessage("Submitting your complaint and verifying details...");
    
    try {
      const locStr = localStorage.getItem("userLocation");
      const location = locStr ? JSON.parse(locStr) : { lat: 0, lng: 0 };
      
      const token = localStorage.getItem("token");
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...complaintData,
          photoURL,
          latitude: location.lat,
          longitude: location.lng,
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok) {
        addBotMessage(`✅ Complaint submitted successfully!\n\nComplaint ID: **${data.complaintID}**\nVerification Status: ${data.verificationStatus}\n\nYou can track this ID in the Track Complaint section. Please save this ID for your records.`, undefined, false, data.complaintID);
      } else {
        addBotMessage(`âŒ Failed to submit: ${data.error}`);
      }
    } catch (err) {
      addBotMessage("âŒ Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      setFlowState("IDLE");
      setComplaintData({});
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 max-w-3xl mx-auto shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 flex items-center shadow-md z-10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">Smart Campus Assistant</h1>
          <p className="text-xs text-indigo-200 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
              msg.sender === "user" ? "bg-[#dcf8c6] text-slate-800 rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"
            }`}>
              {msg.photoData && (
                <img src={msg.photoData} alt="Captured" className="w-full rounded-lg mb-2 border border-slate-200" />
              )}
              <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
              
              {msg.complaintId && (
                <div className="mt-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.complaintId!)}
                    className="flex items-center text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors font-medium"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Complaint ID
                  </button>
                </div>
              )}

              {msg.options && (
                <div className="mt-3 space-y-2">
                  {msg.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(opt)}
                      className="block w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition-colors border border-indigo-100"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {msg.isPhotoRequest && (
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex items-center justify-center w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-2" /> Open Camera
                  </button>
                  <label className="flex items-center justify-center w-full py-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <ImageIcon className="w-4 h-4 mr-2" /> Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    onClick={() => {
                      addUserMessage("⏭️ Skipped Photo");
                      submitComplaint("");
                    }}
                    className="flex items-center justify-center w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Skip Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isSubmitting && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/50 text-white absolute top-0 left-0 right-0 z-10">
            <span className="font-medium">Capture Evidence</span>
            <button onClick={() => setShowCamera(false)} className="text-white p-2">Cancel</button>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 bg-black pb-10 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-white rounded-full border border-slate-200"></div>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-[#f0f0f0] p-3 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-4 py-3 text-sm focus:outline-none shadow-sm"
          disabled={flowState === "AWAITING_PHOTO" || isSubmitting}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || flowState === "AWAITING_PHOTO" || isSubmitting}
          className="ml-2 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
