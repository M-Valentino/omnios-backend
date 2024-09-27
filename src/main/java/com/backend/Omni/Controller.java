package com.backend.Omni;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow all origins (for development purposes)
public class Controller {

  @GetMapping("/message")
  public String getMessage() {
    return "Hello from the Java backend!";
  }
}
