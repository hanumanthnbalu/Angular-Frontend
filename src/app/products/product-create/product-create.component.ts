import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { ProductService } from "../product.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Product } from "../products.model";
import { mimeType } from "./mime-type.validator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-product-create",
  templateUrl: "./product-create.component.html",
  styleUrls: ["./product-create.component.scss"]
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  private mode = "create";
  private productId: string;
  product: Product;
  isLoading = false;
  form: FormGroup;
  imagPreview;
  private authSubscription: Subscription;

  constructor(
    public productService: ProductService,
    public route: ActivatedRoute,
    public authService: AuthService
  ) {}

  countries = [
    {id: 1, name: "United States"},
    {id: 2, name: "Australia"},
    {id: 3, name: "Canada"},
    {id: 4, name: "Brazil"},
    {id: 5, name: "England"}
  ];
 selectedValue = null;

  ngOnInit() {
    this.authSubscription = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: mimeType
      }),
      price: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(1)]
      }),
      description: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("productId")) {
        this.mode = "edit";
        this.productId = paramMap.get("productId");
        this.isLoading = true;
        this.productService
          .getProducts(this.productId)
          .subscribe(productData => {
            this.isLoading = false;
            this.product = {
              id: productData._id,
              name: productData.name,
              image: productData.image,
              price: productData.price,
              description: productData.description,
              creator: productData.creator
            };
            this.form.setValue({
              name: this.product.name,
              image: this.product.image,
              price: this.product.price,
              description: this.product.description
            });
          });
      } else {
        this.mode = "create";
        return (this.productId = null);
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSaveProduct() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.productService.addProduct(
        this.form.value.name,
        this.form.value.image,
        this.form.value.price,
        this.form.value.description
      );
    } else {
      this.productService.updateProduct(
        this.productId,
        this.form.value.name,
        this.form.value.image,
        this.form.value.price,
        this.form.value.description
      );
    }
    this.form.reset();
  }
  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}
