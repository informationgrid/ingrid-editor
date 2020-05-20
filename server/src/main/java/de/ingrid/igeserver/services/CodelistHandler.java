package de.ingrid.igeserver.services;

import de.ingrid.codelists.CodeListService;
import de.ingrid.codelists.model.CodeList;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodelistHandler {

    private final CodeListService codeListService;

    public CodelistHandler(CodeListService codeListService) {
        this.codeListService = codeListService;
    }

    public List<CodeList> getCodelists(List<String> ids) {

        return this.codeListService.getCodeLists().stream()
                .filter(codelist -> ids.contains(codelist.getId()))
                .collect(Collectors.toList());

    }

    public List<CodeList> fetchCodelists() {

        return this.codeListService.updateFromServer();

    }

    public List<CodeList> getAllCodelists() {

        return this.codeListService.getCodeLists();

    }
}
