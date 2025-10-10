
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { interpretVoiceCommand } from '@/app/actions';
import { useGuestStore } from '@/hooks/use-guest-store';
import { useRouter } from 'next/navigation';

export function VoiceCommandButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const {
    openGuestDialog,
    openReservationDialog,
    openTableDialog,
    openWaitingGuestDialog,
  } = useGuestStore();

  useEffect(() => {
    // Check for microphone permission on component mount
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
      setIsPermissionGranted(permissionStatus.state === 'granted');
      permissionStatus.onchange = () => {
        setIsPermissionGranted(permissionStatus.state === 'granted');
      };
    });
  }, []);

  const startRecording = async () => {
    try {
      if (isPermissionGranted === false) {
        toast({
          variant: 'destructive',
          title: 'Microphone permission denied',
          description: 'Please enable microphone access in your browser settings.',
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsPermissionGranted(true);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleVoiceCommand(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop the mic stream
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: 'Listening...', description: 'Speak your command now.' });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsPermissionGranted(false);
      toast({
        variant: 'destructive',
        title: 'Microphone not available',
        description: 'Could not access the microphone. Please check your browser permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceCommand = async (audioBlob: Blob) => {
    toast({ title: 'Processing your command...' });

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      try {
        const result = await interpretVoiceCommand(base64Audio);
        if (!result || !result.command) {
          throw new Error('Could not understand the command.');
        }

        toast({ title: 'Command Understood!', description: `Action: ${result.command}` });
        executeCommand(result);

      } catch (error) {
        console.error('Error interpreting voice command:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Could not process your command.',
        });
      }
    };
  };

  const executeCommand = (result: any) => {
    const { command, args } = result;
    switch(command) {
      case 'navigate':
        router.push(args.page);
        break;
      case 'add_guest':
        openGuestDialog({ ...args, visitDate: new Date(), id: '' });
        break;
      case 'add_reservation':
        openReservationDialog({ ...args, dateOfEvent: new Date(args.dateOfEvent || new Date()), id: '' });
        break;
      case 'add_to_waitlist':
        openWaitingGuestDialog({ ...args, id: '' });
        break;
      case 'add_table':
        openTableDialog(args);
        break;
      default:
        toast({ variant: 'destructive', title: 'Unknown command', description: `The command "${command}" is not supported.`});
    }
  };


  return (
    <Button
      variant="secondary"
      size="icon"
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
    >
      {isRecording ? <MicOff /> : <Mic />}
      <span className="sr-only">Use Voice Command</span>
    </Button>
  );
}
