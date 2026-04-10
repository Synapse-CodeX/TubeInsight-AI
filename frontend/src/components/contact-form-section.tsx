import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactFormSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    requirement: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: 'contact_form'
      };

      await fetch('https://hook.eu2.make.com/jonlu1a1wmy526tvb66a2sd51eqlp1ik', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(submissionData),
      });

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        website: "",
        requirement: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-transparent py-16 md:py-28 px-4 md:px-16 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-20">
        {/* Header */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-4 text-center">
          <div className="w-full flex flex-col items-center gap-6">
            <h2 className="text-foreground text-center text-3xl md:text-4xl lg:text-5xl font-normal leading-tight">
              Let's get started today
            </h2>
            <p className="text-muted-foreground text-center text-base md:text-lg font-normal leading-6 max-w-2xl">
              Fill up the form & we will get back to you in next 24 hours or less
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-foreground text-lg font-normal leading-7">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="h-12 bg-[#0A0A0A] border-[#1F2228] text-foreground"
                required
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-foreground text-lg font-normal leading-7">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 bg-[#0A0A0A] border-[#1F2228] text-foreground"
                required
              />
            </div>

            {/* Website Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="website" className="text-foreground text-lg font-normal leading-7">
                Current Website (Optional)
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="h-12 bg-[#0A0A0A] border-[#1F2228] text-foreground"
              />
            </div>

            {/* Requirement Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="requirement" className="text-foreground text-lg font-normal leading-7">
                Your Requirement *
              </Label>
              <Textarea
                id="requirement"
                name="requirement"
                value={formData.requirement}
                onChange={handleInputChange}
                placeholder="Write in details. Or, record a screen recorded video sharing what you want from us"
                className="min-h-[180px] bg-[#0A0A0A] border-[#1F2228] text-foreground placeholder:text-white/60"
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="outline" 
              size="lg" 
              disabled={isSubmitting}
              className="self-start px-6 py-3 rounded-full border-[#404040] text-white text-sm font-mono font-normal uppercase tracking-[1.4px] leading-5 hover:bg-white/10 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Requirement'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;