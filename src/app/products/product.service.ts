import { Injectable } from "@angular/core";
import { Product } from "./products.model";

import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { post } from "selenium-webdriver/http";

@Injectable({
  providedIn: "root"
})
export class ProductService {
  private products: Product[] = [];
  private productUpdated = new Subject<{ products: Product[], productCount: number}>();

  constructor(public http: HttpClient, public router: Router) {}

  getProduct(productPerPage: number, currentPage: number) {
    // return [...this.products]; //spread operator
    const queryParams = `?pageSize=${productPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; products: any; maxProduct: number }>(
        "http://localhost:3000/api/products" + queryParams
      )
      .pipe(
        map(postData => {
          return {
            products: postData.products.map(product => {
              return {
                name: product.name,
                image: product.image,
                price: product.price,
                description: product.description,
                id: product._id,
                creator: product.creator
              };
            }),
            maxProduct: postData.maxProduct
          };
        })
      )
      .subscribe(transferdProduct => {
        console.log(transferdProduct);
        this.products = transferdProduct.products;
        this.productUpdated.next({
          products: [...this.products],
          productCount: transferdProduct.maxProduct
        });
      });
  }

  getProductUpdated() {
    return this.productUpdated.asObservable();
  }

  getProducts(id: string) {
    return this.http.get<{
      _id: string;
      name: string;
      image: string;
      price: number;
      description: string;
      creator: string;
    }>("http://localhost:3000/api/products/" + id);
  }

  addProduct(name: string, image: File, price: any, description: string) {
    const productData = new FormData();
    productData.append("name", name);
    productData.append("image", image, name);
    productData.append("price", price);
    productData.append("description", description);

    this.http
      .post<{ message: string; product: Product }>(
        "http://localhost:3000/api/products",
        productData
      )
      .subscribe(responseData => {
        // console.log(responseData.message);
        // const product: Product = {
        //   id: responseData.product.id,
        //   image: responseData.product.image,
        //   name: name,
        //   price: price,
        //   description: description
        // };
        // // const id = responseData.productId;
        // // product.id = id;
        // this.products.push(product);
        // this.productUpdated.next([...this.products]);
        this.router.navigate(["/"]);
      });
  }

  updateProduct(
    id: string,
    name: string,
    image: string | File,
    price: number,
    description: string
  ) {
    let productData: Product | FormData;
    if (typeof image === "object") {
      const productData = new FormData();
      productData.append("id", id);
      productData.append("name", name);
      productData.append("image", image, name);
      // productData.append("price", price);
      productData.append("description", description);
    } else {
      const productData = {
        id: id,
        name: name,
        image: image,
        price: price,
        description: description
      };
    }
    this.http
      .put("http://localhost:3000/api/products/" + id, productData)
      .subscribe(response => {
        // const updatedProducts = [...this.products];
        // const oldProductIndex = updatedProducts.findIndex(p => p.id === id);
        // const product: Product = {
        //   id: id,
        //   name: name,
        //   image: "",
        //   price: price,
        //   description: description
        // };
        // updatedProducts[oldProductIndex] = product;
        // this.products = updatedProducts;
        // this.productUpdated.next([...this.products]);
        this.router.navigate(["/"]);
      });
  }

  deleteProduct(productId: string) {
    return this.http
      .delete("http://localhost:3000/api/products/" + productId)
      // .subscribe(() => {
      //   const updatedProduct = this.products.filter(
      //     product => product.id !== productId
      //   );
      //   this.products = updatedProduct;
      //   this.productUpdated.next([...this.products]);
      // });
  }
}
