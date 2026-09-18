import Image from "next/image";
import Link from "next/link";
import { FPTN_PUBLIC_CONTACT } from "@/lib/static-pages/contact-info";

const OWNERS_IMAGE = "/brand/about-gene-teri-bailey.jpg";

const CONTACT_LINES = [
  {
    label: "For sponsorship and advertising opportunities:",
    email: FPTN_PUBLIC_CONTACT.partnershipsEmail,
  },
  {
    label: "For help with your FPTN subscription:",
    email: FPTN_PUBLIC_CONTACT.subscriptionsEmail,
  },
  {
    label: "To submit a story idea or confidential information:",
    email: FPTN_PUBLIC_CONTACT.tipsEmail,
  },
  { label: "For press requests:", email: FPTN_PUBLIC_CONTACT.pressEmail },
] as const;

export default function AboutView() {
  return (
    <div className="mx-auto max-w-[1168px] px-4 py-10 md:px-8 md:py-14 lg:px-10">
      <header className="max-w-[1168px]">
        <h1
          className="font-bold text-[#141921] text-[2.35rem] leading-tight md:text-[3.35rem]"
        >
          About FlashPoint Television Network
        </h1>
        <p className="mt-3 font-article text-xl font-medium text-[#141921] md:text-[1.57rem]">
          Faith. Truth. Voices That Matter.
        </p>
        <p className="mt-6 text-[18px] leading-[1.6] text-[#111] md:text-[21px]">
          FlashPoint Television Network is an independent, multi-platform Christian
          media network covering current events, culture, faith, politics, and the
          issues shaping America through a biblical worldview. Through news,
          commentary, interviews, original programming, live broadcasts, podcasts,
          and digital content, FlashPoint Television Network brings together trusted
          voices from ministry, government, business, media, and culture to address
          the conversations impacting our nation. FlashPoint, the network’s
          flagship program hosted by Gene Bailey, began as a television broadcast
          and has grown into something much bigger. Today, the FlashPoint movement
          reaches audiences through broadcasts, digital platforms, live events,
          educational initiatives, and the nationwide FlashPoint Army community. At
          its core, FlashPoint Television Network exists to inform, equip, and
          activate people to understand what is happening in the world around them,
          stand firmly in biblical truth, and make a meaningful impact in their
          communities and culture.
        </p>
      </header>

      <div className="relative mt-10 aspect-[845/634] w-full max-w-[845px] overflow-hidden rounded-[22px]">
        <Image
          src={OWNERS_IMAGE}
          alt="Gene and Teri Bailey"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 845px"
          priority
        />
      </div>

      <div className="mt-8 max-w-[845px]">
        <p className="font-article text-[1.82rem] font-black text-[#141921]">
          Gene &amp; Teri Bailey
        </p>
        <p className="mt-1 text-[21px] font-medium leading-[1.6] text-[#111]">
          Co-Owners of FlashPoint Television Network
        </p>
      </div>

      <section className="mt-14 max-w-[845px]">
        <h2 className="font-article text-[2.6rem] font-black leading-tight text-[#141921]">
          Gene Bailey
        </h2>
        <p className="mt-2 font-article text-xl font-medium text-[#141921] md:text-[1.57rem]">
          Co-Owner and Host of FlashPoint Television Network
        </p>
        <div className="mt-6 space-y-4 text-[18px] leading-[1.6] text-[#111] md:text-[21px]">
          <p>
            Gene Bailey is the co-owner and host of FlashPoint, one of America’s
            leading Christian news and commentary programs focused on faith,
            culture, current events, and the issues shaping the nation.
          </p>
          <p>
            With decades of experience spanning ministry, broadcasting, leadership,
            and media, Gene has built a reputation for bringing together influential
            voices from the Church, government, business, and culture for
            conversations centered on truth and a biblical worldview.
          </p>
          <p>
            As host of FlashPoint and Revival Radio TV, Gene has interviewed
            leaders, pastors, political figures, authors, commentators, and voices
            from across the country, creating a platform for discussions often
            overlooked by traditional media.
          </p>
          <p>
            Under his leadership, FlashPoint has grown beyond a television program
            into a national movement that includes live broadcasts, events, digital
            media, educational initiatives, and the growing FlashPoint Army
            community.
          </p>
          <p>
            Gene’s passion is to see believers informed, equipped, and activated to
            influence culture while remaining firmly grounded in their faith.
          </p>
        </div>
      </section>

      <section className="mt-14 max-w-[845px]">
        <h2 className="font-article text-[2.6rem] font-black leading-tight text-[#141921]">
          Teri Bailey
        </h2>
        <p className="mt-2 font-article text-xl font-medium text-[#141921] md:text-[1.57rem]">
          Co-Owner of FlashPoint Television Network
        </p>
        <div className="mt-6 space-y-4 text-[18px] leading-[1.6] text-[#111] md:text-[21px]">
          <p>
            Teri Bailey is the co-owner of FlashPoint Television Network and works
            alongside Gene Bailey in advancing the vision, mission, and continued
            growth of FlashPoint.
          </p>
          <p>
            For years, Gene and Teri have worked together through ministry, media,
            publishing, live events, and national outreach with a shared commitment
            to faith, truth, freedom, and equipping people to make a difference in
            their communities.
          </p>
          <p>
            Teri brings a strong passion for people, leadership, and helping
            translate the mission of FlashPoint Television Network into meaningful
            opportunities for audiences to connect, engage, and take action.
          </p>
          <p>
            Together, Gene and Teri co-authored Killing America: Turning the Tide
            on the Tsunami of Darkness, a call to believers to stand for biblical
            values, strengthen their communities, and remain engaged with the
            issues shaping America.
          </p>
          <p>
            As FlashPoint Television Network continues to expand, Teri remains an
            important part of the vision to build a media platform that reaches
            beyond broadcasting and creates lasting impact through programming,
            community, events, and engagement.
          </p>
        </div>
      </section>

      <section className="mt-16 max-w-[845px]">
        <h2 className="font-article text-[3rem] font-black leading-tight text-[#141921]">
          Contact Us
        </h2>
        <ul className="mt-6 space-y-4 text-[18px] leading-[1.6] text-[#111] md:text-[21px]">
          {CONTACT_LINES.map((line) => (
            <li key={line.email}>
              <span>{line.label} </span>
              <a
                href={`mailto:${line.email}`}
                className="font-medium text-[var(--fpn-rojo)] hover:underline"
              >
                {line.email}
              </a>
            </li>
          ))}
          <li>
            <span>Follow us </span>
            <span className="font-medium">
              <a
                href={FPTN_PUBLIC_CONTACT.social.x}
                className="text-[var(--fpn-rojo)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
              {" | "}
              <a
                href={FPTN_PUBLIC_CONTACT.social.facebook}
                className="text-[var(--fpn-rojo)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              {" | "}
              <a
                href={FPTN_PUBLIC_CONTACT.social.instagram}
                className="text-[var(--fpn-rojo)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </span>
          </li>
        </ul>
        <p className="mt-6">
          <Link
            href="/contact"
            className="text-[var(--fpn-rojo)] font-semibold hover:underline"
          >
            View full contact page →
          </Link>
        </p>
      </section>
    </div>
  );
}
