package com.raza.rmeals.service;

import com.raza.rmeals.exception.CartException;
import com.raza.rmeals.exception.CartItemException;
import com.raza.rmeals.exception.FoodException;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.Cart;
import com.raza.rmeals.model.CartItem;
import com.raza.rmeals.model.Food;
import com.raza.rmeals.model.User;
import com.raza.rmeals.repository.CartItemRepository;
import com.raza.rmeals.repository.CartRepository;
import com.raza.rmeals.repository.FoodRepository;
import com.raza.rmeals.request.AddCartItemRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartServiceImplementation implements CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FoodRepository menuItemRepository;

    @Override
    public CartItem addItemToCart(AddCartItemRequest req, String jwt)
            throws UserException, FoodException, CartException, CartItemException {

        User user = userService.findUserProfileByJwt(jwt);

        Optional<Food> menuItem = menuItemRepository.findById(req.getMenuItemId());
        if(menuItem.isEmpty()) {
            throw new FoodException("Menu Item not exist with id "+req.getMenuItemId());
        }

        Cart cart = findCartByUserId(user.getId());

        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getFood().equals(menuItem.get())) {

                int newQuantity = cartItem.getQuantity() + req.getQuantity();
                return updateCartItemQuantity(cartItem.getId(),newQuantity);
            }
        }

        CartItem newCartItem = new CartItem();
        newCartItem.setFood(menuItem.get());
        newCartItem.setQuantity(req.getQuantity());
        newCartItem.setCart(cart);
        newCartItem.setIngredients(req.getIngredients());
        newCartItem.setTotalPrice(req.getQuantity()*menuItem.get().getPrice());

        CartItem savedItem = cartItemRepository.save(newCartItem);
        cart.getItems().add(savedItem);
        cartRepository.save(cart);

        return savedItem;

    }

    @Override
    public CartItem updateCartItemQuantity(Long cartItemId,int quantity) throws CartItemException {
        Optional<CartItem> cartItem=cartItemRepository.findById(cartItemId);
        if(cartItem.isEmpty()) {
            throw new CartItemException("cart item not exist with id "+cartItemId);
        }
        cartItem.get().setQuantity(quantity);
        cartItem.get().setTotalPrice((cartItem.get().getFood().getPrice()*quantity));
        return cartItemRepository.save(cartItem.get());
    }

    @Override
    public Cart removeItemFromCart(Long cartItemId, String jwt) throws UserException,
            CartException, CartItemException {

        User user = userService.findUserProfileByJwt(jwt);

        Cart cart = findCartByUserId(user.getId());

        Optional<CartItem> cartItem=cartItemRepository.findById(cartItemId);

        if(cartItem.isEmpty()) {
            throw new CartItemException("cart item not exist with id "+cartItemId);
        }

        cart.getItems().remove(cartItem.get());
        return cartRepository.save(cart);
    }

    @Override
    public Long calculateCartTotals(Cart cart) throws UserException {

        Long total = 0L;
        for (CartItem cartItem : cart.getItems()) {
            total += cartItem.getFood().getPrice() * cartItem.getQuantity();
        }
        return total;
    }

    @Override
    public Cart findCartById(Long id) throws CartException {
        Optional<Cart> cart = cartRepository.findById(id);
        if(cart.isPresent()) {
            return cart.get();
        }
        throw new CartException("Cart not found with the id "+id);
    }

    @Override
    public Cart findCartByUserId(Long userId) throws CartException, UserException {

        Optional<Cart> opt=cartRepository.findByCustomer_Id(userId);

        if(opt.isPresent()) {
            return opt.get();
        }
        throw new CartException("cart not found");

    }

    @Override
    public Cart clearCart(Long userId) throws CartException, UserException {
        Cart cart = findCartByUserId(userId);

        cart.getItems().clear();

        return cartRepository.save(cart);
    }

}
