import { Component, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-terms",
  templateUrl: "./terms.component.html",
  styleUrls: ["./terms.component.scss"],
})
export class TermsComponent {
  @ViewChild("contentContainer") contentContainer!: ElementRef;

  scrollTo(id: string) {
    const element = this.contentContainer.nativeElement.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}
