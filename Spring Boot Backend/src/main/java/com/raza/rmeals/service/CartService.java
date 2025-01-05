package com.raza.rmeals.service;

import com.raza.rmeals.exception.CartException;
import com.raza.rmeals.exception.CartItemException;
import com.raza.rmeals.exception.FoodException;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.Cart;
import com.raza.rmeals.model.CartItem;
import com.raza.rmeals.request.AddCartItemRequest;

public interface CartService {
    public CartItem addItemToCart(AddCartItemRequest req, String jwt)
            throws UserException, FoodException, CartException, CartItemException;

    public CartItem updateCartItemQuantity(Long cartItemId,int quantity) throws CartItemException;

    public Cart removeItemFromCart(Long cartItemId, String jwt) throws UserException, CartException, CartItemException;

    public Long calculateCartTotals(Cart cart) throws UserException;

    public Cart findCartById(Long id) throws CartException;

    public Cart findCartByUserId(Long userId) throws CartException, UserException;

    public Cart clearCart(Long userId) throws CartException, UserException;
}
