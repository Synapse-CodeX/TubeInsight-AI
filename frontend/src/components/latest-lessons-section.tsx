import { Button } from "@/components/ui/button";
const LatestLessonsSection = () => {
  const lessons = [{
    id: 1,
    videoId: "eoR9k6BttaY",
    date: "February 19, 2025",
    title: "FULL AI process for Landing Page Design with Lovable",
    description: "In this video, I'm showing you the best process of building beautiful websites fast - with AI.",
    url: "https://www.youtube.com/watch?v=eoR9k6BttaY&ab_channel=TheMetaverseGuy"
  }, {
    id: 2,
    videoId: "Yuvno9RhFwg",
    date: "February 19, 2025",
    title: "3 Ways to Build Beautiful Websites Using Lovable AI",
    description: "In this video i show you few fastest way to build sites with AI",
    url: "https://youtu.be/Yuvno9RhFwg?si=WAE_O80Q-m8wouDt"
  }];
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Latest Lessons</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn the latest techniques and best practices from our expert tutorials
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-video bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.videoId}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{lesson.date}</p>
                <h3 className="text-xl font-semibold mb-3">{lesson.title}</h3>
                <p className="text-muted-foreground mb-4">{lesson.description}</p>
                <Button asChild>
                  <a href={lesson.url} target="_blank" rel="noopener noreferrer">
                    Watch Video
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default LatestLessonsSection;