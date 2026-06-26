package kanban.controller;

import kanban.entity.Coluna;
import kanban.service.ColunaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/colunas")
public class ColunaController {
    
    private final ColunaService colunaService;

    public ColunaController(ColunaService colunaService){
        this.colunaService = colunaService;
    }

    @GetMapping
    public ResponseEntity<List<Coluna>> listar(){
        return ResponseEntity.ok(colunaService.listarColunas());
    }
}
