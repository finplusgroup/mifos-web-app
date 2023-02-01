/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ProductsService } from '../../products.service';

/**
 * Create Tax Component component.
 */
@Component({
  selector: 'mifosx-create-tax-component',
  templateUrl: './create-tax-component.component.html',
  styleUrls: ['./create-tax-component.component.scss']
})
export class CreateTaxComponentComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date();
  /** Maximum start date allowed. */
  maxDate = new Date();
  /** Tax Component form. */
  taxComponentForm: FormGroup;
  /** Tax Component template data. */
  taxComponentTemplateData: any;
  /** Credit Account Type data. */
  creditAccountTypeData: any;
  /** Credit Account data. */
  creditAccountData: any;

  /**
   * Retrieves the tax Component template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: FormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { taxComponentTemplate: any }) => {
      this.taxComponentTemplateData = data.taxComponentTemplate;
    });
  }

  /**
   * Creates the tax Component form
   */
  ngOnInit() {
    this.minDate = this.settingsService.minAllowedDate;
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createTaxComponentForm();
    this.setConditionalControls();
  }

  /**
   * Creates the tax Component form
   */
  createTaxComponentForm() {
    this.creditAccountTypeData = this.taxComponentTemplateData.glAccountTypeOptions;
    this.taxComponentForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'percentage': ['', [Validators.required, Validators.pattern('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$'), Validators.max(100)]],
      'creditAccountType': [''],
      'startDate': ['', Validators.required],
    });
  }

  /**
   * Sets the conditional controls of the tax Component form
   */
  setConditionalControls() {
    this.taxComponentForm.get('creditAccountType').valueChanges.subscribe(creditAccountTypeId => {
      this.creditAccountData = this.getAccountsData(creditAccountTypeId);
      this.taxComponentForm.addControl('creditAcountId', new FormControl('', Validators.required));
    });
  }

  /**
   * @param {number} accountTypeId Account type ID of account type.
   * @returns {any} Accounts data
   */
  getAccountsData(accountTypeId: number) {
    switch (accountTypeId) {
      case 1:
        return this.taxComponentTemplateData.glAccountOptions.assetAccountOptions;
      case 2:
        return this.taxComponentTemplateData.glAccountOptions.liabilityAccountOptions;
      case 3:
        return this.taxComponentTemplateData.glAccountOptions.equityAccountOptions;
      case 4:
        return this.taxComponentTemplateData.glAccountOptions.incomeAccountOptions;
      case 5:
        return this.taxComponentTemplateData.glAccountOptions.expenseAccountOptions;
    }
  }

  /**
   * Submits the tax Component form and creates the tax Component,
   * if successful redirects to Tax Components.
   */
  submit() {
    const taxComponentFormData = this.taxComponentForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.taxComponentForm.value.startDate;
    if (taxComponentFormData.startDate instanceof Date) {
      taxComponentFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    const data = {
      ...taxComponentFormData,
      dateFormat,
      locale
    };
    this.productsService.createTaxComponent(data).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}
