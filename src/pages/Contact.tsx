import { Link } from "react-router-dom";
import { ArrowLeft, Github, Linkedin, Mail, ExternalLink, Heart } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Contact</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mx-auto max-w-3xl space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Heart className="mt-0.5 h-5 w-5 text-primary" />
            <p className="text-muted-foreground leading-relaxed">
              Made by <span className="font-medium text-foreground">Sophie Galante</span> based on
              the extensive research of{" "}
              <span className="font-medium text-foreground">Arthur Haddock</span>.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">sophieglte@gmail.com</p>
              </div>
            </div>

            <a
              href="https://github.com/sophiegalante"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <span className="flex items-center gap-3 text-sm">
                <Github className="h-4.5 w-4.5 text-primary" />
                <span className="text-foreground">GitHub</span>
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </a>

            <a
              href="https://www.linkedin.com/in/sophie-galante/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
            >
              <span className="flex items-center gap-3 text-sm">
                <Linkedin className="h-4.5 w-4.5 text-primary" />
                <span className="text-foreground">LinkedIn</span>
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
