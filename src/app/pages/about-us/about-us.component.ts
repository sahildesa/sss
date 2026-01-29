import { Component, AfterViewInit } from '@angular/core';
import * as AOS from 'aos';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  desc?: string;
}

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements AfterViewInit {


   events = [
    {
      tag: 'GRC center',
      title: 'Cyber Regulation in Europe',
      date: 'June 23, 2025'
    },
    {
      tag: 'Secure file transfer',
      title: 'Migration from SWIFT standards to ISO 20022',
      date: 'June 10, 2025'
    },
    {
      tag: 'Secure file transfer',
      title: 'Celebrating Sustainability Day: our commitment at...',
      date: 'June 5, 2025'
    },
    {
      tag: 'Data Security',
      title: 'Why asset management is critical for...',
      date: 'May 28, 2025'
    },
    {
      tag: 'Data Security',
      title: 'IBM Sterling Data Exchange: modernize your dat...',
      date: 'May 20, 2025'
    }
  ];

  ngAfterViewInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });
  }
}

