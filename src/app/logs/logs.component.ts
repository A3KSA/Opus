import { Component } from '@angular/core';
import { LogService } from '../core/services/log.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent {
  logs!: string[];

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.readLogs();
  }

  readLogs(): void {
    this.logService.readIntoLogsFile().subscribe(
      (response) => {
        this.logs = response.map((item) => item.log);
      }
    );
  }
}
