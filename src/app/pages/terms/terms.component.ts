import {
  Component,
  ElementRef,
  ViewChild,
  OnInit
} from "@angular/core";

@Component({
  selector: "app-terms",
  templateUrl: "./terms.component.html",
  styleUrls: ["./terms.component.scss"],
})
export class TermsComponent implements OnInit {

  @ViewChild("contentContainer") contentContainer!: ElementRef;

  ngOnInit(): void {
    // Always start page from top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }
}
