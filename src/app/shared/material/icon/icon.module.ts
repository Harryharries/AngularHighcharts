import { NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { IconComponent } from './icon.component';

@NgModule({
  imports: [MatCommonModule],
  exports: [IconComponent, MatCommonModule],
  declarations: [IconComponent],
})
export class AppMatIconModule {}
