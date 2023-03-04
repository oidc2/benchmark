import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  nIdt: number = 0;
  nIct: number = 0;
  get idtRounds(): number {
    return Number(this.idTokenOptions.value.rounds);
  }
  get idtTime(): number {
    return Number(this.idTokenOptions.value.time);
  }
  get ictRounds(): number {
    return Number(this.idCertificationTokenOptions.value.rounds);
  }
  get ictTime(): number {
    return Number(this.idTokenOptions.value.time);
  }
  idtEvaluationStarted: boolean = false;
  ictEvaluationStarted: boolean = false;
  private _idtEvaluationFinished: boolean = true;
  get idtEvaluationFinished(): boolean {
    return this._idtEvaluationFinished;
  }
  set idtEvaluationFinished(value: boolean) {
    this._idtEvaluationFinished = value;
    if (value == true) {
      this.idTokenOptions.controls.rounds.enable();
      this.idTokenOptions.controls.time.enable();
    } else {
      this.idTokenOptions.controls.rounds.disable();
      this.idTokenOptions.controls.time.disable();
    }
  }
  private _ictEvaluationFinished: boolean = true;
  get ictEvaluationFinished(): boolean {
    return this._ictEvaluationFinished;
  }
  set ictEvaluationFinished(value: boolean) {
    this._ictEvaluationFinished = value;
    if (value == true) {
      this.idCertificationTokenOptions.controls.rounds.enable();
      this.idCertificationTokenOptions.controls.time.enable();
    } else {
      this.idCertificationTokenOptions.controls.rounds.disable();
      this.idCertificationTokenOptions.controls.time.disable();
    }
  }
  idtResults: number[] = [];
  ictResults: number[] = [];
  idTokenOptions = this.formBuilder.group({
    rounds: new FormControl({value: 20, disabled: !this.ictEvaluationFinished }, Validators.required),
    time: new FormControl({value: 5, disabled: !this.ictEvaluationFinished }, Validators.required),
  });
  idCertificationTokenOptions = this.formBuilder.group({
    rounds: new FormControl({value: 20, disabled: !this.ictEvaluationFinished }, Validators.required),
    time: new FormControl({value: 5, disabled: !this.ictEvaluationFinished }, Validators.required),
  });

  constructor(private readonly formBuilder: FormBuilder) {}

  private async requestIdToken(): Promise<void> {
    // TODO: Request ID Token here.
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, Math.random() * 1000);
    });
  }
  private async requestIdCertificationToken(): Promise<void> {
    // TODO: Request ID Certification Token here.
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, Math.random() * 2000);
    });
  }
  async startIdToken(): Promise<void> {
    console.log(`Starting ID Token benchmark with ${this.idtRounds} rounds and ${this.idtTime} seconds ...`);

    // Reset values.
    this.idtEvaluationStarted = true;
    this.idtEvaluationFinished = false;
    this.idtResults.length = 0;

    // Loop over rounds.
    for (this.nIdt = 0; this.nIdt < this.idtRounds; this.nIdt++) {
      console.log(`Starting ID Token benchmark round ${this.nIdt + 1} ...`);

      // Perform benchmark.
      const result = await new Promise<number>(async (resolve) => {
        let value: number = 0;
        let expired: boolean = false;

        // Set timeout which resolves when the time is expired.
        setTimeout(() => {
          expired = true;
          resolve(value);
        }, this.idtTime * 1000);

        // Loop over ID Token requests.
        while (!expired) {
          await this.requestIdToken();
          value++;
        }
      });

      console.log(`Result of ID Token benchmark round ${this.nIdt + 1} is ${result}`)

      // Add result of current benchmark.
      this.idtResults.push(result);
    }

    // Cleanup values.
    this.idtEvaluationFinished = true;

    console.log('ID Token benchmark finished');
  }
  async startIdCertificationToken(): Promise<void> {
    console.log(`Starting ID Certification Token benchmark with ${this.ictRounds} rounds and ${this.ictTime} seconds ...`);

    // Reset values.
    this.ictEvaluationStarted = true;
    this.ictEvaluationFinished = false;
    this.ictResults.length = 0;

    // Loop over rounds.
    for (this.nIct = 0; this.nIct < this.ictRounds; this.nIct++) {
      console.log(`Starting ID Certification Token benchmark round ${this.nIct + 1} ...`);

      // Perform benchmark.
      const result = await new Promise<number>(async (resolve) => {
        let value: number = 0;
        let expired: boolean = false;

        // Set timeout which resolves when the time is expired.
        setTimeout(() => {
          expired = true;
          resolve(value);
        }, this.ictTime * 1000);

        // Loop over ID Token requests.
        while (!expired) {
          await this.requestIdCertificationToken();
          value++;
        }
      });

      console.log(`Result of ID Certification Token benchmark round ${this.nIdt + 1} is ${result}`)

      // Add result of current benchmark.
      this.ictResults.push(result);
    }

    // Cleanup values.
    this.ictEvaluationFinished = true;

    console.log('ID Certification Token benchmark finished');
  }

  private downloadData(data: number[], fileName: string): void {
    let tsv = 'i\tn';
    for (let i = 0; i < data.length; i++) {
      tsv += `\n${i+1}\t${data[i]}`;
    }
    const tsvBlob = new Blob([tsv], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(tsvBlob);
    const downloadElement = document.createElement('a');
    document.body.appendChild(downloadElement);
    downloadElement.href = url;
    downloadElement.style.display = 'none';
    downloadElement.download = fileName;
    downloadElement.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadElement);
  }
  downloadIdtData(): void {
    this.downloadData(this.idtResults, 'idt.tsv');
  }
  downloadIctData(): void {
    this.downloadData(this.ictResults, 'ict.tsv');
  }
}
