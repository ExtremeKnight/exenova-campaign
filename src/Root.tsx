import React from "react";
import { Composition, Folder, Still } from "remotion";
import { Showreel, SHOWREEL_FRAMES } from "./Showreel";
import { AdVideo, AD_FRAMES, joinAd, serviceAd } from "./Ads";
import { MeetTheTeam, MEET_FRAMES } from "./MeetTheTeam";
import { MemberSpotlight, SPOTLIGHT_FULL } from "./scenes/MemberSpotlight";
import {
  CountdownStory,
  JoinPoster,
  MemberPoster,
  LaunchPoster,
  ProcessSlide,
  QuotePoster,
  ServicePoster,
  TeamPoster,
  TipPoster,
} from "./Posters";
import { BootScene } from "./scenes/BootScene";
import { KineticScene } from "./scenes/KineticScene";
import { ServicesScene } from "./scenes/ServicesScene";
import { SaasScene } from "./scenes/SaasScene";
import { WorkScene } from "./scenes/WorkScene";
import { ShapesScene } from "./scenes/ShapesScene";
import { TeamScene } from "./scenes/TeamScene";
import { OutroScene } from "./scenes/OutroScene";
import { C } from "./brand";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Showreel">
        <Composition id="Showreel-9x16" component={Showreel} durationInFrames={SHOWREEL_FRAMES} fps={FPS} width={1080} height={1920} />
        <Composition id="Showreel-4x5" component={Showreel} durationInFrames={SHOWREEL_FRAMES} fps={FPS} width={1080} height={1350} />
        <Composition id="Showreel-16x9" component={Showreel} durationInFrames={SHOWREEL_FRAMES} fps={FPS} width={1920} height={1080} />
      </Folder>

      <Folder name="Showreel-Scenes">
        <Composition id="Scene-Boot" component={BootScene} durationInFrames={95} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Kinetic" component={KineticScene} durationInFrames={150} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Services" component={ServicesScene} durationInFrames={200} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Saas" component={SaasScene} durationInFrames={240} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Work" component={WorkScene} durationInFrames={170} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Shapes" component={ShapesScene} durationInFrames={160} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Team" component={TeamScene} durationInFrames={150} fps={FPS} width={1080} height={1920} />
        <Composition id="Scene-Outro" component={OutroScene} durationInFrames={120} fps={FPS} width={1080} height={1920} defaultProps={{ cta: "Book a project", path: "" }} />
      </Folder>

      <Folder name="Team">
        <Composition id="MeetTheTeam-9x16" component={MeetTheTeam} durationInFrames={MEET_FRAMES} fps={FPS} width={1080} height={1920} />
        <Composition id="MeetTheTeam-4x5" component={MeetTheTeam} durationInFrames={MEET_FRAMES} fps={FPS} width={1080} height={1350} />
        <Composition id="Spotlight-shan" component={MemberSpotlight} durationInFrames={SPOTLIGHT_FULL} fps={FPS} width={1080} height={1920} defaultProps={{ slug: "shan-patrick-cruz", compact: false }} />
        <Composition id="Spotlight-justine" component={MemberSpotlight} durationInFrames={SPOTLIGHT_FULL} fps={FPS} width={1080} height={1920} defaultProps={{ slug: "justine-mojica", compact: false }} />
        <Composition id="Spotlight-rei" component={MemberSpotlight} durationInFrames={SPOTLIGHT_FULL} fps={FPS} width={1080} height={1920} defaultProps={{ slug: "reinard-gabriel-saddi", compact: false }} />
        <Composition id="Spotlight-orlando" component={MemberSpotlight} durationInFrames={SPOTLIGHT_FULL} fps={FPS} width={1080} height={1920} defaultProps={{ slug: "orlando-chavez", compact: false }} />
        <Still id="Poster-Member-shan" component={MemberPoster} width={1080} height={1350} defaultProps={{ slug: "shan-patrick-cruz" }} />
        <Still id="Poster-Member-justine" component={MemberPoster} width={1080} height={1350} defaultProps={{ slug: "justine-mojica" }} />
        <Still id="Poster-Member-rei" component={MemberPoster} width={1080} height={1350} defaultProps={{ slug: "reinard-gabriel-saddi" }} />
        <Still id="Poster-Member-orlando" component={MemberPoster} width={1080} height={1350} defaultProps={{ slug: "orlando-chavez" }} />
      </Folder>

      <Folder name="Ads">
        <Composition id="Ad-brand" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={serviceAd("brand")} />
        <Composition id="Ad-web" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={serviceAd("web")} />
        <Composition id="Ad-film" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={serviceAd("film")} />
        <Composition id="Ad-interactive" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={serviceAd("interactive")} />
        <Composition id="Ad-uiux" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={serviceAd("uiux")} />
        <Composition id="Ad-join" component={AdVideo} durationInFrames={AD_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={joinAd} />
      </Folder>

      <Folder name="Posters">
        <Still id="Poster-Launch-4x5" component={LaunchPoster} width={1080} height={1350} />
        <Still id="Poster-Launch-9x16" component={LaunchPoster} width={1080} height={1920} />
        <Still id="Poster-Service-brand" component={ServicePoster} width={1080} height={1350} defaultProps={{ service: "brand", index: 1 }} />
        <Still id="Poster-Service-web" component={ServicePoster} width={1080} height={1350} defaultProps={{ service: "web", index: 2 }} />
        <Still id="Poster-Service-film" component={ServicePoster} width={1080} height={1350} defaultProps={{ service: "film", index: 3 }} />
        <Still id="Poster-Service-interactive" component={ServicePoster} width={1080} height={1350} defaultProps={{ service: "interactive", index: 4 }} />
        <Still id="Poster-Service-uiux" component={ServicePoster} width={1080} height={1350} defaultProps={{ service: "uiux", index: 5 }} />
        <Still id="Poster-Join-4x5" component={JoinPoster} width={1080} height={1350} />
        <Still id="Poster-Join-9x16" component={JoinPoster} width={1080} height={1920} />
        <Still id="Poster-Team-4x5" component={TeamPoster} width={1080} height={1350} />
      </Folder>

      <Folder name="Carousel-Process">
        <Still id="Process-0" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 0 }} />
        <Still id="Process-1" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 1 }} />
        <Still id="Process-2" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 2 }} />
        <Still id="Process-3" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 3 }} />
        <Still id="Process-4" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 4 }} />
        <Still id="Process-5" component={ProcessSlide} width={1080} height={1350} defaultProps={{ step: 5 }} />
      </Folder>

      <Folder name="Quotes-Tips">
        <Still id="Quote-1" component={QuotePoster} width={1080} height={1350} defaultProps={{ quote: "Brought strong design sense and clear communication to the project.", who: "Product Manager, Startup" }} />
        <Still id="Quote-2" component={QuotePoster} width={1080} height={1350} defaultProps={{ quote: "Impressive ability to balance aesthetics with usability.", who: "Design Lead, Studio" }} />
        <Still id="Quote-3" component={QuotePoster} width={1080} height={1350} defaultProps={{ quote: "Great eye for detail and a solid understanding of what makes design effective.", who: "Marketing Manager, Brand Team" }} />
        <Still id="Tip-logo" component={TipPoster} width={1080} height={1350} defaultProps={{ kicker: "Brand tip", title: "3 signs your logo needs a refresh.", points: ["It falls apart at small sizes.", "It could belong to your competitor.", "You need three versions to explain it."], tint: C.accent }} />
        <Still id="Tip-web" component={TipPoster} width={1080} height={1350} defaultProps={{ kicker: "Web tip", title: "Make your site feel instant.", points: ["Resize and compress every image.", "Show content before scripts load.", "Cut anything that doesn't earn its place."], tint: C.coral }} />
        <Still id="Tip-video" component={TipPoster} width={1080} height={1350} defaultProps={{ kicker: "Video tip", title: "Hook viewers in 2 seconds.", points: ["Open on motion, not a logo.", "Put the payoff in the first frame.", "Caption everything — most watch muted."], tint: C.amber }} />
        <Still id="Tip-hire" component={TipPoster} width={1080} height={1350} defaultProps={{ kicker: "Client tip", title: "Before you hire a creative team.", points: ["Know the problem, not just the look.", "Share three references you love.", "Agree on rounds and a deadline up front."], tint: C.moss }} />
      </Folder>

      <Folder name="Stories">
        <Still id="Countdown-3" component={CountdownStory} width={1080} height={1920} defaultProps={{ n: 3, label: "Something new is coming" }} />
        <Still id="Countdown-2" component={CountdownStory} width={1080} height={1920} defaultProps={{ n: 2, label: "Something new is coming" }} />
        <Still id="Countdown-1" component={CountdownStory} width={1080} height={1920} defaultProps={{ n: 1, label: "Something new is coming" }} />
      </Folder>
    </>
  );
};
