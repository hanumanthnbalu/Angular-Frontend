import { Component, OnInit, OnDestroy } from "@angular/core";
import { Product } from "../products.model";
import { ProductService } from "../product.service";

import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = false;
  totalProduct = 10;
  pageSize = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: string;

  private productSubscription: Subscription;

  constructor(public productService: ProductService,
              private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.productService.getProduct(this.pageSize,  this.currentPage);
    this.userId = this.authService.getUserId();
    this.productSubscription = this.productService
      .getProductUpdated()
      .subscribe((productsData: {products: Product[], productCount: number }) => {
        this.isLoading = false;
        this.totalProduct = productsData.productCount;
        this.products = productsData.products;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService.getAuthStatusListner()
      .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId();
      });
  }
  onChangedPage(pagedata: PageEvent) {
    this.isLoading = true;
    this.currentPage = pagedata.pageIndex + 1;
    this.pageSize = pagedata.pageSize;
    this.productService.getProduct(this.pageSize, this.currentPage);
  }

  onDelete(productId: string) {
    this.isLoading = true;
    this.productService.deleteProduct(productId).subscribe(() => {
    this.productService.getProduct(this.pageSize, this.currentPage);
    }, () => {
        this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.productSubscription.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
